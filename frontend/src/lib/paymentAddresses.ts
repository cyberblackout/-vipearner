import { supabase } from './supabase';

export interface SavedPaymentAddress {
  id: string;
  type: 'momo';
  network: 'MTN' | 'Telecel' | 'AirtelTigo';
  accountNumber: string; // 10-digit Ghana Mobile Money Phone Number
  accountName: string; // Registered SIM Name (e.g. KWAME MENSAH)
  remark?: string; // Optional user note (e.g. "Primary MoMo", "Telecel Cash")
  isDefault?: boolean;
  createdAt: string;
}

const STORAGE_PREFIX = 've_saved_addresses_';

export function validatePaymentAddress(
  _network: 'MTN' | 'Telecel' | 'AirtelTigo',
  address: string
): { valid: boolean; error?: string } {
  const clean = address.trim();
  if (!clean) {
    return { valid: false, error: 'Mobile Money phone number cannot be empty' };
  }

  // Validate Ghana phone number format (e.g. 024XXXXXXX, 055XXXXXXX, +233XXXXXXXXX)
  const phoneRegex = /^(?:(?:\+233)|(?:0))(?:[235][0-9]{8})$/;
  const digitsOnly = clean.replace(/\s+/g, '');
  if (!phoneRegex.test(digitsOnly)) {
    return {
      valid: false,
      error: 'Please enter a valid 10-digit Ghana phone number (e.g. 0244123456 or 0201234567)',
    };
  }

  return { valid: true };
}

export function getSavedAddresses(userId?: string): SavedPaymentAddress[] {
  const key = STORAGE_PREFIX + (userId || 'guest');
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strict filter: Mobile Money networks only (MTN, Telecel, AirtelTigo)
        const momoOnly: SavedPaymentAddress[] = parsed
          .filter(
            (item: any) =>
              item &&
              (item.network === 'MTN' || item.network === 'Telecel' || item.network === 'AirtelTigo')
          )
          .map((item: any) => ({
            ...item,
            type: 'momo' as const,
          }));

        if (momoOnly.length > 0) {
          if (!momoOnly.some((a) => a.isDefault)) {
            momoOnly[0].isDefault = true;
          }
          return momoOnly;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved addresses:', e);
  }

  return [];
}

/**
 * Sync saved addresses from Supabase Auth user metadata into local state
 */
export async function syncSavedAddressesWithSupabase(userId?: string): Promise<SavedPaymentAddress[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.payment_addresses) {
      const metaAddrs = user.user_metadata.payment_addresses;
      if (Array.isArray(metaAddrs)) {
        const key = STORAGE_PREFIX + (userId || user.id || 'guest');
        localStorage.setItem(key, JSON.stringify(metaAddrs));
        return metaAddrs;
      }
    }
  } catch (err) {
    console.warn('Failed to sync addresses from Supabase:', err);
  }
  return getSavedAddresses(userId);
}

export function savePaymentAddress(
  userId: string | undefined,
  address: Omit<SavedPaymentAddress, 'id' | 'createdAt'>
): SavedPaymentAddress {
  const current = getSavedAddresses(userId);
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'addr_' + Date.now();
  const createdAt = new Date().toISOString();

  // If set as default or this is the first address, clear other defaults
  const shouldBeDefault = address.isDefault || current.length === 0;

  const updatedCurrent = shouldBeDefault
    ? current.map((a) => ({ ...a, isDefault: false }))
    : current;

  const newRecord: SavedPaymentAddress = {
    ...address,
    type: 'momo',
    id,
    isDefault: shouldBeDefault,
    createdAt,
  };

  const nextList = [newRecord, ...updatedCurrent];
  const key = STORAGE_PREFIX + (userId || 'guest');
  localStorage.setItem(key, JSON.stringify(nextList));

  // Persist directly to Supabase User Metadata in the background
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      supabase.auth.updateUser({
        data: { payment_addresses: nextList },
      }).catch((err) => console.warn('Supabase metadata save warning:', err));
    }
  });

  return newRecord;
}

export function deletePaymentAddress(userId: string | undefined, id: string): void {
  const current = getSavedAddresses(userId);
  const nextList = current.filter((a) => a.id !== id);

  if (current.some((a) => a.id === id && a.isDefault) && nextList.length > 0) {
    nextList[0].isDefault = true;
  }

  const key = STORAGE_PREFIX + (userId || 'guest');
  localStorage.setItem(key, JSON.stringify(nextList));

  // Persist directly to Supabase User Metadata in the background
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      supabase.auth.updateUser({
        data: { payment_addresses: nextList },
      }).catch((err) => console.warn('Supabase metadata delete warning:', err));
    }
  });
}

export function setDefaultPaymentAddress(userId: string | undefined, id: string): void {
  const current = getSavedAddresses(userId);
  const nextList = current.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }));

  const key = STORAGE_PREFIX + (userId || 'guest');
  localStorage.setItem(key, JSON.stringify(nextList));

  // Persist directly to Supabase User Metadata in the background
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      supabase.auth.updateUser({
        data: { payment_addresses: nextList },
      }).catch((err) => console.warn('Supabase metadata setDefault warning:', err));
    }
  });
}
