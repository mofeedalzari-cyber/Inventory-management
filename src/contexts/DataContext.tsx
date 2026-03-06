import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Category {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  managerName?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  price: number;
  barcode: string;
  imageUrl?: string;
  minStock: number;
  stockByStore: Record<string, number>; // storeId -> quantity
}

export interface Movement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  fromStoreId?: string;
  toStoreId?: string;
  date: string;
  entityId?: string; // supplier or destination
}

export interface Entity {
  id: string;
  name: string;
  type: 'supplier' | 'destination';
  phone?: string;
}

interface DataContextType {
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  stores: Store[];
  addStore: (name: string, managerName?: string, phone?: string) => void;
  updateStore: (id: string, name: string, managerName?: string, phone?: string) => void;
  deleteStore: (id: string) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'barcode'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  movements: Movement[];
  addMovement: (movement: Omit<Movement, 'id' | 'date'>) => void;
  updateMovement: (id: string, movement: Omit<Movement, 'id' | 'date'>) => void;
  deleteMovement: (id: string) => void;
  entities: Entity[];
  addEntity: (name: string, type: 'supplier' | 'destination', phone?: string) => void;
  updateEntity: (id: string, name: string, phone?: string) => void;
  deleteEntity: (id: string) => void;
  syncWithServer: () => Promise<void>;
  fetchFromServer: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchFromServer = async () => {
    try {
      const serverUrl = localStorage.getItem('server_url') || 'https://smart-inventory-tow7.onrender.com';
      const baseUrl = serverUrl.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/sync`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCategories(data.categories || []);
          setStores(data.stores || []);
          setProducts(data.products || []);
          setMovements(data.movements || []);
          setEntities(data.entities || []);
          localStorage.setItem('appData', JSON.stringify(data));
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch from server:', error);
    }
  };

  const syncWithServer = async () => {
    try {
      const data = {
        categories,
        stores,
        products,
        movements,
        entities
      };
      const serverUrl = localStorage.getItem('server_url') || 'https://smart-inventory-tow7.onrender.com';
      const baseUrl = serverUrl.replace(/\/$/, '');
      await fetch(`${baseUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to sync with server:', error);
      throw error;
    }
  };

  // Load from server
  useEffect(() => {
    const initData = async () => {
      // Try to fetch latest from server
      await fetchFromServer();
      
      // If still empty, mock initial data if nothing exists
      if (categories.length === 0 && stores.length === 0) {
        const defaultStoreId = uuidv4();
        const defaultCategoryId = uuidv4();
        setStores([{ id: defaultStoreId, name: 'المخزن الرئيسي' }]);
        setCategories([{ id: defaultCategoryId, name: 'قطع غيار عامة' }]);
      }
      
      setIsLoaded(true);
    };

    initData();
  }, []);

  // Auto-sync to server
  useEffect(() => {
    if (isLoaded) {
      // Auto sync
      const timeoutId = setTimeout(() => {
        syncWithServer().catch(e => console.error('Auto sync failed', e));
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, stores, products, movements, entities, isLoaded]);

  const addCategory = (name: string) => {
    setCategories([...categories, { id: uuidv4(), name }]);
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = (id: string) => {
    const isUsed = products.some(p => p.categoryId === id);
    if (isUsed) {
      throw new Error('لا يمكن حذف هذا الصنف لأنه مرتبط بمنتجات موجودة');
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  const addStore = (name: string, managerName?: string, phone?: string) => {
    setStores([...stores, { id: uuidv4(), name, managerName, phone }]);
  };

  const updateStore = (id: string, name: string, managerName?: string, phone?: string) => {
    setStores(stores.map(s => s.id === id ? { ...s, name, managerName, phone } : s));
  };

  const deleteStore = (id: string) => {
    const isUsed = movements.some(m => m.fromStoreId === id || m.toStoreId === id) || products.some(p => p.stockByStore[id] > 0);
    if (isUsed) {
      throw new Error('لا يمكن حذف هذا المخزن لأنه مرتبط بحركات أو يحتوي على مخزون');
    }
    setStores(stores.filter(s => s.id !== id));
  };

  const addProduct = (product: Omit<Product, 'id' | 'barcode'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    const isUsed = movements.some(m => m.productId === id);
    if (isUsed) {
      throw new Error('لا يمكن حذف هذا المنتج لأنه مرتبط بحركات سابقة');
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const addMovement = (movement: Omit<Movement, 'id' | 'date'>) => {
    const newMovement: Movement = {
      ...movement,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    
    // Update product stock
    setProducts(products.map(p => {
      if (p.id === movement.productId) {
        const newStock = { ...p.stockByStore };
        if (movement.type === 'in' && movement.toStoreId) {
          newStock[movement.toStoreId] = (newStock[movement.toStoreId] || 0) + movement.quantity;
        } else if (movement.type === 'out' && movement.fromStoreId) {
          newStock[movement.fromStoreId] = Math.max(0, (newStock[movement.fromStoreId] || 0) - movement.quantity);
        } else if (movement.type === 'transfer' && movement.fromStoreId && movement.toStoreId) {
          newStock[movement.fromStoreId] = Math.max(0, (newStock[movement.fromStoreId] || 0) - movement.quantity);
          newStock[movement.toStoreId] = (newStock[movement.toStoreId] || 0) + movement.quantity;
        }
        return { ...p, stockByStore: newStock };
      }
      return p;
    }));

    setMovements([newMovement, ...movements]);
  };

  const updateMovement = (id: string, updatedMovement: Omit<Movement, 'id' | 'date'>) => {
    const oldMovement = movements.find(m => m.id === id);
    if (!oldMovement) return;

    // Revert old movement effect on stock
    let tempProducts = products.map(p => {
      if (p.id === oldMovement.productId) {
        const newStock = { ...p.stockByStore };
        if (oldMovement.type === 'in' && oldMovement.toStoreId) {
          newStock[oldMovement.toStoreId] = Math.max(0, (newStock[oldMovement.toStoreId] || 0) - oldMovement.quantity);
        } else if (oldMovement.type === 'out' && oldMovement.fromStoreId) {
          newStock[oldMovement.fromStoreId] = (newStock[oldMovement.fromStoreId] || 0) + oldMovement.quantity;
        } else if (oldMovement.type === 'transfer' && oldMovement.fromStoreId && oldMovement.toStoreId) {
          newStock[oldMovement.fromStoreId] = (newStock[oldMovement.fromStoreId] || 0) + oldMovement.quantity;
          newStock[oldMovement.toStoreId] = Math.max(0, (newStock[oldMovement.toStoreId] || 0) - oldMovement.quantity);
        }
        return { ...p, stockByStore: newStock };
      }
      return p;
    });

    // Apply new movement effect on stock
    tempProducts = tempProducts.map(p => {
      if (p.id === updatedMovement.productId) {
        const newStock = { ...p.stockByStore };
        if (updatedMovement.type === 'in' && updatedMovement.toStoreId) {
          newStock[updatedMovement.toStoreId] = (newStock[updatedMovement.toStoreId] || 0) + updatedMovement.quantity;
        } else if (updatedMovement.type === 'out' && updatedMovement.fromStoreId) {
          newStock[updatedMovement.fromStoreId] = Math.max(0, (newStock[updatedMovement.fromStoreId] || 0) - updatedMovement.quantity);
        } else if (updatedMovement.type === 'transfer' && updatedMovement.fromStoreId && updatedMovement.toStoreId) {
          newStock[updatedMovement.fromStoreId] = Math.max(0, (newStock[updatedMovement.fromStoreId] || 0) - updatedMovement.quantity);
          newStock[updatedMovement.toStoreId] = (newStock[updatedMovement.toStoreId] || 0) + updatedMovement.quantity;
        }
        return { ...p, stockByStore: newStock };
      }
      return p;
    });

    setProducts(tempProducts);
    setMovements(movements.map(m => m.id === id ? { ...m, ...updatedMovement } : m));
  };

  const deleteMovement = (id: string) => {
    const movement = movements.find(m => m.id === id);
    if (!movement) return;

    // Revert movement effect on stock
    setProducts(currentProducts => currentProducts.map(p => {
      if (p.id === movement.productId) {
        const newStock = { ...p.stockByStore };
        if (movement.type === 'in' && movement.toStoreId) {
          newStock[movement.toStoreId] = Math.max(0, (newStock[movement.toStoreId] || 0) - movement.quantity);
        } else if (movement.type === 'out' && movement.fromStoreId) {
          newStock[movement.fromStoreId] = (newStock[movement.fromStoreId] || 0) + movement.quantity;
        } else if (movement.type === 'transfer' && movement.fromStoreId && movement.toStoreId) {
          newStock[movement.fromStoreId] = (newStock[movement.fromStoreId] || 0) + movement.quantity;
          newStock[movement.toStoreId] = Math.max(0, (newStock[movement.toStoreId] || 0) - movement.quantity);
        }
        return { ...p, stockByStore: newStock };
      }
      return p;
    }));

    setMovements(currentMovements => currentMovements.filter(m => m.id !== id));
  };

  const addEntity = (name: string, type: 'supplier' | 'destination', phone?: string) => {
    setEntities([...entities, { id: uuidv4(), name, type, phone }]);
  };

  const updateEntity = (id: string, name: string, phone?: string) => {
    setEntities(entities.map(e => e.id === id ? { ...e, name, phone } : e));
  };

  const deleteEntity = (id: string) => {
    const isUsed = movements.some(m => m.entityId === id);
    if (isUsed) {
      throw new Error('لا يمكن حذف هذه الجهة لأنها مرتبطة بحركات سابقة');
    }
    setEntities(entities.filter(e => e.id !== id));
  };

  return (
    <DataContext.Provider value={{
      categories, addCategory, updateCategory, deleteCategory,
      stores, addStore, updateStore, deleteStore,
      products, addProduct, updateProduct, deleteProduct,
      movements, addMovement, updateMovement, deleteMovement,
      entities, addEntity, updateEntity, deleteEntity,
      syncWithServer, fetchFromServer
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
