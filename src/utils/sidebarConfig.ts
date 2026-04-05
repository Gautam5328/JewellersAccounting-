import { t } from 'fyo';
import { routeFilters } from 'src/utils/filters';
import { fyo } from '../initFyo';
import { SidebarConfig, SidebarItem, SidebarRoot } from './types';

export function getSidebarConfig(): SidebarConfig {
  const sideBar = getCompleteSidebar();
  return getFilteredSidebar(sideBar);
}

function getFilteredSidebar(sideBar: SidebarConfig): SidebarConfig {
  return sideBar.filter((root) => {
    root.items = root.items?.filter((item) => {
      if (item.hidden !== undefined) {
        return !item.hidden();
      }

      return true;
    });

    if (root.hidden !== undefined) {
      return !root.hidden();
    }

    return true;
  });
}

function getRegionalSidebar(): SidebarRoot[] {
  const hasGstin = !!fyo.singles?.AccountingSettings?.gstin;
  if (!hasGstin) {
    return [];
  }

  return [
    {
      label: t`GST`,
      name: 'gst',
      icon: 'gst',
      route: '/report/GSTR1',
      items: [
        {
          label: t`GSTR1`,
          name: 'gstr1',
          route: '/report/GSTR1',
        },
        {
          label: t`GSTR2`,
          name: 'gstr2',
          route: '/report/GSTR2',
        },
      ],
    },
  ];
}

function getInventorySidebar(): SidebarRoot[] {
  return [
    {
      label: t`Inventory`,
      name: 'inventory',
      icon: 'inventory',
      iconSize: '18',
      route: '/jewelry/inventory',
      items: [
        {
          label: t`Overview`,
          name: 'jewelry-inventory',
          route: '/jewelry/inventory',
        },
        {
          label: t`Stock Entry`,
          name: 'inventory-stock-entry',
          route: '/jewelry/stock-entry',
        },
        {
          label: t`Pieces`,
          name: 'inventory-pieces',
          route: '/list/JewelryItem',
          schemaName: 'JewelryItem',
        },
        {
          label: t`Stock Movements`,
          name: 'inventory-stock-movements',
          route: '/list/JewelryStockLedger',
          schemaName: 'JewelryStockLedger',
        },
      ],
    },
  ];
}

function getPOSSidebar() {
  return {
    label: t`POS`,
    name: 'pos',
    route: '/pos',
    icon: 'pos',
    hidden: () => !fyo.singles.InventorySettings?.enablePointOfSale,
  };
}

function getReportSidebar() {
  return {
    label: t`Reports`,
    name: 'reports',
    icon: 'reports',
    route: '/jewelry/reports',
    items: [
      {
        label: t`Overview`,
        name: 'jewelry-reports-overview',
        route: '/jewelry/reports',
      },
      {
        label: t`Dashboard`,
        name: 'jewelry-dashboard',
        route: '/jewelry/dashboard',
      },
      {
        label: t`Invoices`,
        name: 'jewelry-invoices',
        route: '/list/JewelryInvoice',
        schemaName: 'JewelryInvoice',
      },
      {
        label: t`Stock Movements`,
        name: 'jewelry-stock-ledger-report',
        route: '/list/JewelryStockLedger',
        schemaName: 'JewelryStockLedger',
      },
      {
        label: t`Gold Rate History`,
        name: 'gold-rate-history',
        route: '/list/GoldRate',
        schemaName: 'GoldRate',
      },
      {
        label: t`Diamond Rate History`,
        name: 'diamond-rate-history',
        route: '/list/DiamondRate',
        schemaName: 'DiamondRate',
      },
    ],
  };
}

function getCompleteSidebar(): SidebarConfig {
  return [
    {
      label: t`Get Started`,
      name: 'get-started',
      route: '/get-started',
      icon: 'general',
      iconSize: '24',
      iconHeight: 5,
      hidden: () => !!fyo.singles.SystemSettings?.hideGetStarted,
    },
    {
      label: t`Dashboard`,
      name: 'dashboard',
      route: '/',
      icon: 'dashboard',
    },
    {
      label: t`Sales`,
      name: 'sales',
      icon: 'sales',
      route: '/jewelry/invoice',
      items: [
        {
          label: t`New Invoice`,
          name: 'new-invoice',
          route: '/jewelry/invoice',
        },
        {
          label: t`Invoices`,
          name: 'invoices',
          route: '/list/JewelryInvoice',
          schemaName: 'JewelryInvoice',
        },
        {
          label: t`Customers`,
          name: 'customers',
          route: `/list/Party/${t`Customers`}`,
          schemaName: 'Party',
          filters: routeFilters.Customers,
        },
        {
          label: t`Catalog`,
          name: 'catalog',
          route: `/list/Item/${t`Catalog`}`,
          schemaName: 'Item',
          filters: routeFilters.SalesItems,
        },
        {
          label: t`Rates`,
          name: 'rates',
          route: '/jewelry/rates',
        },
      ] as SidebarItem[],
    },
    {
      label: t`Masters`,
      name: 'common-entries',
      icon: 'common-entries',
      route: '/list/JewelryItem',
      items: [
        {
          label: t`Customers`,
          name: 'masters-customers',
          route: `/list/Party/${t`Customers`}`,
          schemaName: 'Party',
          filters: routeFilters.Customers,
        },
        {
          label: t`Catalog`,
          name: 'masters-catalog',
          route: `/list/Item/${t`Catalog`}`,
          schemaName: 'Item',
          filters: routeFilters.SalesItems,
        },
        {
          label: t`Pieces`,
          name: 'masters-pieces',
          route: '/list/JewelryItem',
          schemaName: 'JewelryItem',
        },
        {
          label: t`Stock Movements`,
          name: 'masters-stock-movements',
          route: '/list/JewelryStockLedger',
          schemaName: 'JewelryStockLedger',
        },
        {
          label: t`Rates`,
          name: 'masters-rates',
          route: '/jewelry/rates',
        },
      ] as SidebarItem[],
    },
    getReportSidebar(),
    getInventorySidebar(),
    getPOSSidebar(),
    getRegionalSidebar(),
    {
      label: t`Setup`,
      name: 'setup',
      icon: 'settings',
      route: '/chart-of-accounts',
      items: [
        {
          label: t`Chart of Accounts`,
          name: 'chart-of-accounts',
          route: '/chart-of-accounts',
        },
        {
          label: t`Tax Templates`,
          name: 'taxes',
          route: '/list/Tax',
          schemaName: 'Tax',
        },
        {
          label: t`Import Wizard`,
          name: 'import-wizard',
          route: '/import-wizard',
        },
        {
          label: t`Print Templates`,
          name: 'print-template',
          route: `/list/PrintTemplate/${t`Print Templates`}`,
        },
        {
          label: t`Customize Form`,
          name: 'customize-form',
          // route: `/customize-form`,
          route: `/list/CustomForm/${t`Customize Form`}`,
          hidden: () =>
            !fyo.singles.AccountingSettings?.enableFormCustomization,
        },
        {
          label: t`Settings`,
          name: 'settings',
          route: '/settings',
        },
      ] as SidebarItem[],
    },
  ].flat();
}
