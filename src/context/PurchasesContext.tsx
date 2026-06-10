import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

type Offerings = Awaited<ReturnType<typeof Purchases.getOfferings>>;

// ─── Replace these with your RevenueCat project API keys ─────────────────────
const API_KEYS = {
  ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  android: 'goog_cxwHelezxxgtEsBkkfEvEpjdbVg',
};

export const ENTITLEMENT_ID = 'Manga Hub Pro';

interface PurchasesContextType {
  isPremium: boolean;
  offerings: Offerings | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType>({
  isPremium: false,
  offerings: null,
  customerInfo: null,
  isLoading: true,
  purchase: async () => {},
  restore: async () => {},
});

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });

    (async () => {
      try {
        const [info, offers] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);
        setCustomerInfo(info);
        setOfferings(offers);
      } catch (e) {
        console.error('[Purchases] init error', e);
      } finally {
        setIsLoading(false);
      }
    })();

    Purchases.addCustomerInfoUpdateListener(setCustomerInfo);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(setCustomerInfo);
    };
  }, []);

  const isPremium =
    !!customerInfo?.entitlements.active[ENTITLEMENT_ID];

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    const { customerInfo: info } = await Purchases.purchasePackage(pkg);
    setCustomerInfo(info);
  }, []);

  const restore = useCallback(async () => {
    const info = await Purchases.restorePurchases();
    setCustomerInfo(info);
  }, []);

  return (
    <PurchasesContext.Provider value={{ isPremium, offerings, customerInfo, isLoading, purchase, restore }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  return useContext(PurchasesContext);
}
