import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/hooks/useOrders";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  order_count: number;
  total_spent: number;
  first_order_date: string;
  last_order_date: string;
}

interface CustomerExportOptions {
  format: 'csv' | 'json' | 'excel';
  dateRange?: { start: string; end: string };
  includeOrderDetails?: boolean;
}

export class CustomerExportService {
  static async exportCustomers(userId: string, options: CustomerExportOptions): Promise<Blob | null> {
    try {
      // Verify the user has access to these catalogs by checking ownership
      const { data: catalogs, error: catalogsError } = await supabase
        .from('catalogs')
        .select('id')
        .eq('user_id', userId);

      if (catalogsError) throw catalogsError;

      if (!catalogs || catalogs.length === 0) {
        console.log('No catalogs found for user');
        return null;
      }

      // Get distinct customers from orders associated with the user's catalogs
      // Using RLS policies to ensure user can only access their own data
      let query = supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          total_amount,
          created_at,
          catalog_id
        `)
        .in('catalog_id', catalogs.map(c => c.id))
        .not('customer_email', 'is', null);

      // Apply date range filter if provided
      if (options.dateRange) {
        query = query
          .gte('created_at', options.dateRange.start)
          .lte('created_at', options.dateRange.end);
      }

      const { data: orders, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        console.log('No orders found for export');
        return null;
      }

      // Process orders to aggregate customer data
      const customerMap = new Map<string, Customer>();

      orders.forEach(order => {
        const email = order.customer_email;
        if (!email) return;

        if (customerMap.has(email)) {
          const customer = customerMap.get(email)!;
          customer.order_count += 1;
          customer.total_spent += order.total_amount || 0;
          customer.last_order_date = new Date(order.created_at) > new Date(customer.last_order_date) 
            ? order.created_at 
            : customer.last_order_date;
        } else {
          customerMap.set(email, {
            id: email, // Using email as ID since it's the common field
            name: order.customer_name || 'Unknown',
            email: email,
            phone: order.customer_phone || '',
            order_count: 1,
            total_spent: order.total_amount || 0,
            first_order_date: order.created_at,
            last_order_date: order.created_at
          });
        }
      });

      const customers = Array.from(customerMap.values());

      // Generate export based on format
      switch (options.format) {
        case 'csv':
          return this.generateCSV(customers);
        case 'json':
          return this.generateJSON(customers);
        case 'excel':
          return this.generateExcel(customers);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  }

  private static generateCSV(customers: Customer[]): Blob {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Order Count',
      'Total Spent',
      'First Order Date',
      'Last Order Date'
    ];
    
    const csvContent = [
      headers.join(','),
      ...customers.map(customer => [
        `"${customer.name.replace(/"/g, '""')}"`,
        `"${customer.email.replace(/"/g, '""')}"`,
        `"${customer.phone.replace(/"/g, '""')}"`,
        customer.order_count,
        customer.total_spent,
        `"${new Date(customer.first_order_date).toLocaleDateString()}"`,
        `"${new Date(customer.last_order_date).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private static generateJSON(customers: Customer[]): Blob {
    const jsonString = JSON.stringify(customers, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private static generateExcel(customers: Customer[]): Blob {
    // For Excel, we'll generate a CSV that Excel can open
    // A proper Excel implementation would require a library like SheetJS
    return this.generateCSV(customers);
  }

  static async downloadExport(userId: string, options: CustomerExportOptions): Promise<void> {
    try {
      const blob = await this.exportCustomers(userId, options);
      
      if (!blob) {
        console.warn('No data to export');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `customers-export-${date}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }
}