import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AdminContext = createContext({
  globalEditMode: false,
  setGlobalEditMode: () => {},
  siteContent: {},
  updateContent: async () => {},
});

export const AdminProvider = ({ children }) => {
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const [siteContent, setSiteContent] = useState({});
  const [userToken, setUserToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Read userInfo from localStorage safely on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        const u = JSON.parse(stored);
        setUserToken(u?.token || null);
        setIsAdmin(!!u?.isAdmin);
      }
    } catch {
      setUserToken(null);
      setIsAdmin(false);
    }
  }, []);

  // Fetch site content from backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await axios.get('/api/products/site-content/');
        const contentMap = {};
        (Array.isArray(data) ? data : []).forEach(item => {
          contentMap[item.key] = item.value;
        });
        setSiteContent(contentMap);
      } catch {
        // Fail silently — defaults will be shown
      }
    };
    fetchContent();
  }, []);

  const updateContent = async (key, value, type = 'text') => {
    if (!userToken) throw new Error('Not authenticated');
    const formData = new FormData();
    formData.append('key', key);
    formData.append('content_type', type);
    if (type === 'image' && value instanceof File) {
      formData.append('image', value);
    } else {
      formData.append('value', value);
    }
    const config = {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'multipart/form-data',
      },
    };
    const { data } = await axios.post('/api/products/site-content/update/', formData, config);
    setSiteContent(prev => ({ ...prev, [key]: data.value }));
    return data.value;
  };

  const handleSetGlobalEditMode = (val) => {
    if (isAdmin) setGlobalEditMode(val);
  };

  return (
    <AdminContext.Provider value={{
      globalEditMode,
      setGlobalEditMode: handleSetGlobalEditMode,
      siteContent,
      updateContent,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
