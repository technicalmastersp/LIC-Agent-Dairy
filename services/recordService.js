import apiClient from '../api/apiClient';

export const createRecord = async (data) => {
  try {
    const res = await apiClient.post('/user/createNewRecord', data);
    return res.data;
  } catch (error) {
    console.error('Error creating record:', error);
    throw error;
  }
};

export const getAllRecords = async () => {
  try {
    const res = await apiClient.post('user/getAllPolicyRecords', {page: "all", limit: "all"});
    if (!res.data || !res.data.records) {
      return [];
    } else {
      let currentUser = localStorage.getItem('currentUser');
      currentUser = currentUser ? JSON.parse(currentUser) : null;
      if (currentUser){
        currentUser.totalRecords = res.data.records.length;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
    return res.data.records;
  } catch (error) {
    console.error('Error loading user records:', error);
    return [];
  }
};

export const updateRecord = async (formData, recordId) => {
  const res = await apiClient.put(`/user/updatePolicyRecord`, formData, {
    params: {
      recordId, // query param
    },
  });
  return res.data;
};

export const deleteRecord = async (id) => {
  // Currently not in use 
  // const res = await apiClient.delete(`/user/deletePolicyRecord`, { data: { recordId: id } });
  // return res.data;
};
