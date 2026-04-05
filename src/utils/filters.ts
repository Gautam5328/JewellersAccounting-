import { ModelNameEnum } from 'models/types';

export const routeFilters = {
  JewelryItems: { metalType: ['in', ['Gold', 'Silver', 'Diamond']] },
  SalesItems: {
    for: ['in', ['Sales', 'Both']],
    metalType: ['in', ['Gold', 'Silver', 'Diamond']],
  },
  PurchaseItems: {
    for: ['in', ['Purchases', 'Both']],
    metalType: ['in', ['Gold', 'Silver', 'Diamond']],
  },
  Items: {
    for: 'Both',
    metalType: ['in', ['Gold', 'Silver', 'Diamond']],
  },
  PurchasePayments: {
    referenceType: ModelNameEnum.PurchaseInvoice,
  },
  SalesPayments: {
    referenceType: ModelNameEnum.SalesInvoice,
  },
  Suppliers: { role: ['in', ['Supplier', 'Both']] },
  Customers: { role: ['in', ['Customer', 'Both']] },
  Party: { role: 'Both' },
};

export const createFilters = {
  SalesItems: { for: 'Sales', metalType: 'Gold' },
  PurchaseItems: { for: 'Purchases', metalType: 'Gold' },
  Items: { for: 'Both', metalType: 'Gold' },
  PurchasePayments: { paymentType: 'Pay' },
  SalesPayments: { paymentType: 'Receive' },
  Suppliers: { role: 'Supplier' },
  Customers: { role: 'Customer' },
  Party: { role: 'Both' },
};
