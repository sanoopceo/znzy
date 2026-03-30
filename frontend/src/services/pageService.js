import axios from 'axios';

const authConfig = (token) => ({
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

const pageService = {
  getPageById: async (pageId, token) => {
    const { data } = await axios.get(`/api/pages/${pageId}/`, authConfig(token));
    return data;
  },
  getPublicPageBySlug: async (slug, token) => {
    const { data } = await axios.get(`/api/pages/${slug}/`, authConfig(token));
    return data;
  },
  listPages: async (token) => {
    const { data } = await axios.get('/api/pages/', authConfig(token));
    return data;
  },
  createPage: async (payload, token) => {
    const { data } = await axios.post('/api/pages/', payload, authConfig(token));
    return data;
  },
  updatePage: async (pageId, payload, token) => {
    const { data } = await axios.put(`/api/pages/${pageId}/`, payload, authConfig(token));
    return data;
  },
  publishPage: async (pageId, token) => {
    const { data } = await axios.post(`/api/pages/${pageId}/publish/`, {}, authConfig(token));
    return data;
  },
  createVersion: async (payload, token) => {
    const { data } = await axios.post('/api/page-versions/', payload, authConfig(token));
    return data;
  },
  listVersions: async (pageId, token) => {
    const { data } = await axios.get(`/api/page-versions/${pageId}/`, authConfig(token));
    return data;
  },
  restoreVersion: async (versionId, token) => {
    const { data } = await axios.post(`/api/page-versions/restore/${versionId}/`, {}, authConfig(token));
    return data;
  },
  listBlocks: async () => {
    const { data } = await axios.get('/api/blocks/');
    return data;
  },
  createBlock: async (payload, token) => {
    const { data } = await axios.post('/api/blocks/', payload, authConfig(token));
    return data;
  },
};

export default pageService;
