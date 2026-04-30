import { apiClient } from "./api";

export interface CreateEntityPayload {
  entityType: string | null;
  entityName?: string;
  universityType?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  address?: string;
  pincode?: string;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryAdmin?: string[] | null;
  degrees?: { degreeType: string | null; departments: string[] }[];
}

export const entityApi = {
  createEntity: async (data: CreateEntityPayload, logo: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (logo) {
      formData.append("logo", logo);
    }

    return apiClient.post("/master/createEntity", formData);
  },
  updateEntity: async (id: string, data: CreateEntityPayload, logo?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (logo) {
      formData.append("logo", logo);
    }

    return apiClient.put(`/master/updateEntity/${id}`, formData);
  },

 
createBatch: async (formData: FormData) => {
  return apiClient.post("/batch/create_batch", formData);
},

  updateBatch: async (id: string, formData: FormData) => {
    return apiClient.put(`/batch/update_batch/${id}`, formData);
  },
 deleteSessionDocument: (sessionId: string, documentId: string) => {
  return apiClient.delete(
    `/batch/delete_session_document/${sessionId}?documentId=${documentId}`
  );
}

};
