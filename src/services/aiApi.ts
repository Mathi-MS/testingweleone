const { VITE_API_BASE_URL } = import.meta.env;
const GRAPHQL_URL = `${VITE_API_BASE_URL}/chat/graphql`;

export interface AIMessage {
  role: 'user' | 'ai';
  content: string;
}

const graphqlRequest = async (query: string, variables: any = {}, token: string, userId: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
    };

    if (token && token !== 'guest-token') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(GRAPHQL_URL
        , {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables })
        });

    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data;
};

export const aiApi = {
    getChats: async (token: string, userId: string) => {
        const query = `
            query GetAIChats {
                getAIChats {
                    id
                    title
                    source {
                        type
                        courseId
                        sessionId
                    }
                    totalTokensUsed
                    totalMessages
                    createdAt
                    updatedAt
                }
            }
        `;
        const data = await graphqlRequest(query, {}, token, userId);
        return data.getAIChats;
    },

    createChat: async (token: string, userId: string, title?: string, sourceType?: string, courseId?: string, sessionId?: string) => {
        const query = `
            mutation CreateAIChat($input: CreateAIChatInput!) {
                createAIChat(input: $input) {
                    id
                    title
                    source {
                        type
                        courseId
                        sessionId
                    }
                    createdAt
                }
            }
        `;
        const variables = { input: { title, sourceType, courseId, sessionId } };
        const data = await graphqlRequest(query, variables, token, userId);
        return data.createAIChat;
    },

    getChatHistory: async (token: string, chatId: string, userId: string, page = 1, size = 20) => {
        if (!chatId || chatId === 'undefined') {
            throw new Error('Invalid chatId provided');
        }

        const query = `
            query GetAIChatMessages($chatId: ID!, $page: Int, $size: Int) {
                getAIChatMessages(chatId: $chatId, page: $page, size: $size) {
                    messages {
                        id
                        role
                        content
                        tokensUsed
                        createdAt
                    }
                    pagination {
                        page
                        size
                        total
                        totalPages
                    }
                }
            }
        `;
        const variables = { chatId, page, size };
        const data = await graphqlRequest(query, variables, token, userId);
        return data.getAIChatMessages;
    },

    deleteChat: async (token: string, chatId: string, userId: string) => {
        const query = `
            mutation DeleteAIChat($chatId: ID!) {
                deleteAIChat(chatId: $chatId)
            }
        `;
        const variables = { chatId };
        const data = await graphqlRequest(query, variables, token, userId);
        return data.deleteAIChat;
    }
};
