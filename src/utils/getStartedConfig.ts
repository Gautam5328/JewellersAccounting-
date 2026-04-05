import { t } from 'fyo';
import { ModelNameEnum } from 'models/types';
import { openSettings, routeTo } from './ui';
import { GetStartedConfigItem } from './types';

export function getGetStartedConfig(): GetStartedConfigItem[] {
  /* eslint-disable @typescript-eslint/no-misused-promises */
  return [
    {
      label: t`Organisation`,
      items: [
        {
          key: 'General',
          label: t`General`,
          icon: 'general',
          description: t`Set up your company information, email, country and fiscal year`,
          fieldname: 'companySetup',
          action: () => openSettings(ModelNameEnum.AccountingSettings),
        },
        {
          key: 'Print',
          label: t`Print`,
          icon: 'invoice',
          description: t`Customize your invoices by adding a logo and address details`,
          fieldname: 'printSetup',
          action: () => openSettings(ModelNameEnum.PrintSettings),
        },
        {
          key: 'System',
          label: t`System`,
          icon: 'system',
          description: t`Setup system defaults like date format and display precision`,
          fieldname: 'systemSetup',
          action: () => openSettings(ModelNameEnum.SystemSettings),
        },
      ],
    },
    {
      label: t`Accounts`,
      items: [
        {
          key: 'Review Accounts',
          label: t`Review Accounts`,
          icon: 'review-ac',
          description: t`Review your chart of accounts, add any account or tax heads as needed`,
          action: () => routeTo('/chart-of-accounts'),
          fieldname: 'chartOfAccountsReviewed',
          documentation: 'https://docs.frappe.io/books/chart-of-accounts',
        },
        {
          key: 'Opening Balances',
          label: t`Opening Balances`,
          icon: 'opening-ac',
          fieldname: 'openingBalanceChecked',
          description: t`Set up your opening balances before performing any accounting entries`,
          documentation: 'https://docs.frappe.io/books/setup-opening-balances',
        },
        {
          key: 'Add Taxes',
          label: t`Add Taxes`,
          icon: 'percentage',
          fieldname: 'taxesAdded',
          description: t`Set up your tax templates for your sales or purchase transactions`,
          action: () => routeTo('/list/Tax'),
          documentation:
            'https://docs.frappe.io/books/create-initial-entries#add-taxes',
        },
      ],
    },
    {
      label: t`Jewelry Sales`,
      items: [
        {
          key: 'Add Jewelry Sales Items',
          label: t`Add Jewelry Items`,
          icon: 'item',
          description: t`Add jewelry products you sell to your customers`,
          action: () =>
            routeTo({
              path: `/list/Item/${t`Jewelry Sales Items`}`,
              query: {
                filters: JSON.stringify({
                  for: 'Sales',
                  metalType: ['in', ['Gold', 'Silver', 'Diamond']],
                }),
              },
            }),
          fieldname: 'salesItemCreated',
          documentation:
            'https://docs.frappe.io/books/create-initial-entries#add-sales-items',
        },
        {
          key: 'Add Customers',
          label: t`Add Customers`,
          icon: 'customer',
          description: t`Add customers to create your first jewelry invoice`,
          action: () =>
            routeTo({
              path: `/list/Party/${t`Customers`}`,
              query: {
                filters: JSON.stringify({ role: 'Customer' }),
              },
            }),
          fieldname: 'customerCreated',
          documentation:
            'https://docs.frappe.io/books/create-initial-entries#add-customers',
        },
        {
          key: 'Create Sales Invoice',
          label: t`Create Jewelry Invoice`,
          icon: 'sales-invoice',
          description: t`Create your first jewelry sales invoice`,
          action: () => routeTo('/list/SalesInvoice'),
          fieldname: 'invoiceCreated',
          documentation: 'https://docs.frappe.io/books/sales-invoices',
        },
      ],
    },
    {
      label: t`Jewelry Purchases`,
      items: [
        {
          key: 'Add Jewelry Purchase Items',
          label: t`Add Jewelry Items`,
          icon: 'item',
          description: t`Add jewelry items that you buy from suppliers`,
          action: () =>
            routeTo({
              path: `/list/Item/${t`Jewelry Purchase Items`}`,
              query: {
                filters: JSON.stringify({
                  for: 'Purchases',
                  metalType: ['in', ['Gold', 'Silver', 'Diamond']],
                }),
              },
            }),
          fieldname: 'purchaseItemCreated',
        },
        {
          key: 'Add Suppliers',
          label: t`Add Suppliers`,
          icon: 'supplier',
          description: t`Add suppliers/karigars for jewelry procurement`,
          action: () =>
            routeTo({
              path: `/list/Party/${t`Suppliers`}`,
              query: { filters: JSON.stringify({ role: 'Supplier' }) },
            }),
          fieldname: 'supplierCreated',
        },
        {
          key: 'Create Purchase Invoice',
          label: t`Create Jewelry Purchase Invoice`,
          icon: 'purchase-invoice',
          description: t`Create your first jewelry purchase invoice`,
          action: () => routeTo('/list/PurchaseInvoice'),
          fieldname: 'billCreated',
          documentation:
            'https://docs.frappe.io/books/purchase-invoices#creating-purchase-invoices',
        },
      ],
    },
  ];
}
