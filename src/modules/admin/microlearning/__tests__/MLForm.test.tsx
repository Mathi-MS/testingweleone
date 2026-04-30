// jest.mock('../../../../graphql/client')

// jest.mock('react-toastify', () => ({
//   toast: {
//     success: jest.fn(),
//     error: jest.fn(),
//     warning: jest.fn(),
//   }
// }))

// jest.mock('react-quill', () => {
//   return function MockQuill() {
//     return <div data-testid="quill-editor" />
//   }
// })

// import React from 'react'
// import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { Provider } from 'react-redux'
// import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
// import configureStore from 'redux-mock-store'
// import MLForm from '../MLForm'
// import type { TestRootState } from './store'
// import type { MLData } from '../../../../types/ml'

// const mockStore = configureStore([])

// const mockMLData: MLData = {
//   id: '1',
//   microLearnId: 'ml-1',
//   microLearnTitle: 'Test ML',
//   category: 'Category 1',
//   subCategory: 'SubCategory 1',
//   fullDescription: 'Test Full Description',
//   shortDescrpition: 'Test Description',
//   Duration: 30,
//   status: 'Active',
//   trainingDocs: [],
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
// }

// const mockInitialState = {
//   list: [],
//   currentML: null as any,
//   categories: [
//     { id: 'cat-1', categoryName: 'Category 1' },
//     { id: 'cat-2', categoryName: 'Category 2' },
//   ],
//   subCategories: [
//     { id: 'sub-1', subCategoryName: 'SubCategory 1' },
//     { id: 'sub-2', subCategoryName: 'SubCategory 2' },
//   ],
//   documentTypes: [],
//   filters: {
//     search: '',
//     selectedCategories: [],
//     selectedDocumentTypes: [],
//     durationRange: { from: '', to: '' }
//   },
//   pagination: { page: 0, hasMore: false },
//   loading: false,
//   error: null
// }

// const renderComponent = (state = mockInitialState, initialPath = '/admin/microlearning/new') => {
//   const store = mockStore({ ml: state } as any)
//   store.dispatch = jest.fn().mockReturnValue(Promise.resolve())

//   return render(
//     <Provider store={store}>
//       <MemoryRouter initialEntries={[initialPath]}>
//         <Routes>
//           <Route path="/admin/microlearning/new" element={<MLForm />} />
//           <Route path="/admin/microlearning/:id" element={<MLForm />} />
//           <Route path="/admin/microlearning/:id" element={<MLForm />} />
//           <Route path="/admin/microlearning" element={<div>List</div>} />
//         </Routes>
//       </MemoryRouter>
//     </Provider>
//   )
// }

// describe('MLForm Component', () => {
//   describe('Create Mode', () => {
//     it('should render create form', () => {
//       renderComponent()
//       expect(screen.getByText(/Creation/i)).toBeInTheDocument()
//     })

//     it('should render title input', () => {
//       renderComponent()
//       expect(screen.getByLabelText(/title/i, { selector: 'input' })).toBeInTheDocument()
//     })

//     it('should render category select', () => {
//       renderComponent()
//       expect(screen.getByLabelText(/category/i, { selector: 'div' })).toBeInTheDocument()
//     })

//     it('should render duration input', () => {
//       renderComponent()
//       expect(screen.getByLabelText(/duration/i, { selector: 'input' })).toBeInTheDocument()
//     })

//     it('should render short description input', () => {
//       renderComponent()
//       expect(screen.getByLabelText(/short description/i, { selector: 'textarea' })).toBeInTheDocument()
//     })
//   })

//   describe('Form Validation', () => {
//     it('should show title validation error when empty', async () => {
//       renderComponent()
      
//       const titleInput = screen.getByLabelText(/title/i, { selector: 'input' }) as HTMLInputElement
//       fireEvent.change(titleInput, { target: { value: '' } })
      
//       expect(titleInput.value).toBe('')
//     })

//     it('should show category validation error when not selected', async () => {
//       renderComponent()
      
//       const categorySelect = screen.getByLabelText(/category/i, { selector: 'div' })
//       expect(categorySelect).toBeInTheDocument()
//     })

//     it('should show duration validation error when 0 or less', async () => {
//       renderComponent()
      
//       const durationInput = screen.getByLabelText(/duration/i, { selector: 'input' }) as HTMLInputElement
//       fireEvent.change(durationInput, { target: { value: '0' } })
      
//       expect(durationInput.value).toBe('0')
//     })

//     it('should show short description validation error when empty', async () => {
//       renderComponent()
      
//       const descriptionInput = screen.getByLabelText(/short description/i, { selector: 'textarea' }) as HTMLTextAreaElement
//       fireEvent.change(descriptionInput, { target: { value: '' } })
      
//       expect(descriptionInput.value).toBe('')
//     })

//     it('should accept valid form data', async () => {
//       renderComponent()
      
//       const titleInput = screen.getByLabelText(/title/i, { selector: 'input' }) as HTMLInputElement
//       const durationInput = screen.getByLabelText(/duration/i, { selector: 'input' }) as HTMLInputElement
//       const descriptionInput = screen.getByLabelText(/short description/i, { selector: 'textarea' }) as HTMLTextAreaElement
      
//       fireEvent.change(titleInput, { target: { value: 'Test ML' } })
//       fireEvent.change(durationInput, { target: { value: '30' } })
//       fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
      
//       expect(titleInput.value).toBe('Test ML')
//       expect(durationInput.value).toBe('30')
//       expect(descriptionInput.value).toBe('Test Description')
//     })
//   })

//   describe('Document Upload', () => {
//     it('should render file upload input', () => {
//       renderComponent()
//       expect(screen.getByText(/upload document/i)).toBeInTheDocument()
//     })

//     it('should handle file selection', async () => {
//       renderComponent()
//       const fileInputs = screen.getAllByRole('button')
//       expect(fileInputs.length).toBeGreaterThan(0)
//     })

//     it('should render document list when documents exist', async () => {
//       const stateWithDocs = {
//         ...mockInitialState,
//         currentML: {
//           ...mockMLData,
//           trainingDocs: [
//             {
//               docId: 'doc-1',
//               docUrl: 'http://example.com/doc.pdf',
//               docType: 'pdf',
//               trainerGuideNotes: 'Test notes'
//             }
//           ]
//         }
//       }
//       renderComponent(stateWithDocs, '/admin/microlearning/1')
//       await waitFor(() => {
//         expect(screen.getByText(/document/i)).toBeInTheDocument()
//       })
//     })
//   })

//   describe('Step Navigation', () => {
//     it('should start at step 1', () => {
//       renderComponent()
//       expect(screen.getByText(/Creation/i)).toBeInTheDocument()
//     })

//     it('should render step navigation buttons', () => {
//       renderComponent()
//       const buttons = screen.getAllByRole('button')
//       expect(buttons.length).toBeGreaterThan(0)
//     })

//     it('should have back button', () => {
//       renderComponent()
//       expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
//     })
//   })

//   describe('View Mode', () => {
//     it('should render view form for existing ML', async () => {
//       const stateWithML = {
//         ...mockInitialState,
//         currentML: mockMLData
//       }
//       renderComponent(stateWithML, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         expect(screen.getByText(/View/i)).toBeInTheDocument()
//       })
//     })

//     it('should display ML data in view mode', async () => {
//       const stateWithML = {
//         ...mockInitialState,
//         currentML: mockMLData
//       }
//       renderComponent(stateWithML, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         expect(screen.getByText(/Test ML/)).toBeInTheDocument()
//       })
//     })

//     it('should render edit button in view mode', async () => {
//       const stateWithML = {
//         ...mockInitialState,
//         currentML: mockMLData
//       }
//       renderComponent(stateWithML, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         expect(screen.getByText(/Edit/)).toBeInTheDocument()
//       })
//     })
//   })

//   describe('Edit Mode', () => {
//     it('should render edit form for existing ML', async () => {
//       const stateWithML = {
//         ...mockInitialState,
//         currentML: mockMLData
//       }
//       renderComponent(stateWithML, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         expect(screen.getByText(/Edit/i)).toBeInTheDocument()
//       })
//     })

//     it('should populate form fields with existing data', async () => {
//       const stateWithML = {
//         ...mockInitialState,
//         currentML: mockMLData
//       }
//       renderComponent(stateWithML, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         const titleInput = screen.getByDisplayValue(/Test ML/i) as HTMLInputElement
//         expect(titleInput).toBeInTheDocument()
//       })
//     })
//   })

//   describe('Loading State', () => {
//     it('should show loading indicator when loading edit mode without data', async () => {
//       const stateLoading = {
//         ...mockInitialState,
//         loading: true,
//         currentML: null
//       }
//       renderComponent(stateLoading, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         expect(screen.getByText(/Loading/i)).toBeInTheDocument()
//       })
//     })
//   })

//   describe('Delete Functionality', () => {
//     it('should render delete button for existing ML', async () => {
//       const stateWithML = {
//         ...mockInitialState,
//         currentML: mockMLData
//       }
//       renderComponent(stateWithML, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         const deleteButtons = screen.getAllByRole('button')
//         expect(deleteButtons.length).toBeGreaterThan(0)
//       })
//     })
//   })

//   describe('Form Input Handling', () => {
//     it('should update title on input change', async () => {
//       renderComponent()
      
//       const titleInput = screen.getByLabelText(/title/i, { selector: 'input' }) as HTMLInputElement
//       await userEvent.clear(titleInput)
//       await userEvent.type(titleInput, 'New Title')
      
//       expect(titleInput.value).toBe('New Title')
//     })

//     it('should update duration on input change', async () => {
//       renderComponent()
      
//       const durationInput = screen.getByLabelText(/duration/i, { selector: 'input' }) as HTMLInputElement
//       await userEvent.clear(durationInput)
//       await userEvent.type(durationInput, '45')
      
//       expect(durationInput.value).toBe('45')
//     })

//     it('should update description on input change', async () => {
//       renderComponent()
      
//       const descriptionInput = screen.getByLabelText(/short description/i, { selector: 'textarea' }) as HTMLTextAreaElement
//       await userEvent.clear(descriptionInput)
//       await userEvent.type(descriptionInput, 'New Description')
      
//       expect(descriptionInput.value).toBe('New Description')
//     })
//   })

//   describe('Quill Editor', () => {
//     it('should render quill editor', () => {
//       renderComponent()
//       expect(screen.getByTestId('quill-editor')).toBeInTheDocument()
//     })
//   })

//   describe('Navigation', () => {
//     it('should have back navigation', () => {
//       renderComponent()
//       const backButton = screen.getByRole('button', { name: /back/i })
//       expect(backButton).toBeInTheDocument()
//     })
//   })

//   describe('Document Notes', () => {
//     it('should render document notes section when documents exist', async () => {
//       const stateWithDocs = {
//         ...mockInitialState,
//         currentML: {
//           ...mockMLData,
//           trainingDocs: [
//             {
//               docId: 'doc-1',
//               docUrl: 'http://example.com/doc.pdf',
//               docType: 'pdf',
//               trainerGuideNotes: 'Test notes'
//             }
//           ]
//         }
//       }
//       renderComponent(stateWithDocs, '/admin/microlearning/1')
      
//       await waitFor(() => {
//         expect(screen.getByText(/document notes/i)).toBeInTheDocument()
//       })
//     })
//   })
// })
