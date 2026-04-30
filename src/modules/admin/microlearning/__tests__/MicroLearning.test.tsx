// jest.mock('../../../../graphql/client')

// import React from 'react'
// import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { Provider } from 'react-redux'
// import { BrowserRouter } from 'react-router-dom'
// import configureStore from 'redux-mock-store'
// import MicroLearning from '../MicroLearning'
// import type { TestRootState } from './store'
// import type { MLData } from '../../../../types/ml'

// const mockStore = configureStore([])

// const mockMLData: MLData[] = [
//   {
//     id: '1',
//     microLearnId: 'ml-1',
//     microLearnTitle: 'Test ML 1',
//     category: 'Category 1',
//     subCategory: 'SubCategory 1',
//     fullDescription: 'Full description 1',
//     shortDescrpition: 'Description 1',
//     Duration: 30,
//     status: 'Active',
//     trainingDocs: [],
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: '2',
//     microLearnId: 'ml-2',
//     microLearnTitle: 'Test ML 2',
//     category: 'Category 2',
//     subCategory: 'SubCategory 2',
//     fullDescription: 'Full description 2',
//     shortDescrpition: 'Description 2',
//     Duration: 45,
//     status: 'Draft',
//     trainingDocs: [],
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ]

// const mockInitialState = {
//   ml: {
//     list: mockMLData,
//     currentML: null,
//     categories: [
//       { id: 'cat-1', categoryName: 'Category 1' },
//       { id: 'cat-2', categoryName: 'Category 2' },
//     ],
//     subCategories: [
//       { id: 'sub-1', subCategoryName: 'SubCategory 1' },
//       { id: 'sub-2', subCategoryName: 'SubCategory 2' },
//     ],
//     documentTypes: [
//       { name: 'PDF', doc_type: 'pdf' },
//       { name: 'Video', doc_type: 'video' },
//     ],
//     filters: {
//       search: '',
//       selectedCategories: [],
//       selectedDocumentTypes: [],
//       durationRange: { from: '', to: '' }
//     },
//     pagination: {
//       page: 0,
//       hasMore: false,
//       total: 2
//     },
//     loading: false,
//     error: null
//   }
// }

// const renderComponent = (state = mockInitialState) => {
//   const store = mockStore(state as any)
//   store.dispatch = jest.fn().mockReturnValue(Promise.resolve())

//   return render(
//     <Provider store={store}>
//       <BrowserRouter>
//         <MicroLearning />
//       </BrowserRouter>
//     </Provider>
//   )
// }

// describe('MicroLearning Component', () => {
//   describe('Rendering', () => {
//     it('should render the component with title', () => {
//       renderComponent()
//       expect(screen.getByText(/Mirco Learning/i)).toBeInTheDocument()
//     })

//     it('should render the create button', () => {
//       renderComponent()
//       expect(screen.getByRole('button', { name: /Create ML/i })).toBeInTheDocument()
//     })

//     it('should render search input', () => {
//       renderComponent()
//       const searchInput = screen.getByPlaceholderText(/Search Mirco Learning titles/i)
//       expect(searchInput).toBeInTheDocument()
//     })

//     it('should render filter button', () => {
//       renderComponent()
//       const filterButtons = screen.getAllByRole('button')
//       expect(filterButtons.length).toBeGreaterThan(0)
//     })

//     it('should render table with ML data', () => {
//       renderComponent()
//       expect(screen.getByText('Test ML 1')).toBeInTheDocument()
//       expect(screen.getByText('Test ML 2')).toBeInTheDocument()
//     })

//     it('should display correct record count', () => {
//       renderComponent()
//       expect(screen.getByText(/1 - 2 of 2/)).toBeInTheDocument()
//     })
//   })

//   describe('Filtering', () => {
//     it('should render filter configurations', () => {
//       renderComponent()
//       expect(screen.getByText('Course')).toBeInTheDocument()
//       expect(screen.getByText('Duration')).toBeInTheDocument()
//       expect(screen.getByText('Language')).toBeInTheDocument()
//     })

//     it('should render category checkboxes', () => {
//       renderComponent()
//       expect(screen.getByText('Category 1')).toBeInTheDocument()
//       expect(screen.getByText('Category 2')).toBeInTheDocument()
//     })

//     it('should render select all checkbox in filters', () => {
//       renderComponent()
//       const selectAllLabels = screen.getAllByText('Select all')
//       expect(selectAllLabels.length).toBeGreaterThan(0)
//     })

//     it('should toggle filter collapsed state', () => {
//       renderComponent()
//       const filterButton = screen.getByRole('button', { name: '' })
      
//       fireEvent.click(filterButton)
      
//       expect(filterButton).toBeInTheDocument()
//     })
//   })

//   describe('Search Functionality', () => {
//     it('should handle search input change', async () => {
//       const store = mockStore(mockInitialState)
//       store.dispatch = jest.fn().mockReturnValue(Promise.resolve())
      
//       render(
//         <Provider store={store}>
//           <BrowserRouter>
//             <MicroLearning />
//           </BrowserRouter>
//         </Provider>
//       )

//       const searchInput = screen.getByPlaceholderText(/Search Mirco Learning titles/i) as HTMLInputElement
      
//       await userEvent.type(searchInput, 'test')
      
//       expect(searchInput.value).toBe('test')
//     })
//   })

//   describe('Duration Range Filter', () => {
//     it('should render duration range inputs', () => {
//       renderComponent()
//       const inputs = screen.getAllByPlaceholderText(/0|10/)
//       expect(inputs.length).toBeGreaterThan(0)
//     })

//     it('should render range slider', () => {
//       renderComponent()
//       const rangeInputs = screen.getAllByRole('slider')
//       expect(rangeInputs.length).toBeGreaterThan(0)
//     })

//     it('should display reset button when range is set', () => {
//       const customState = {
//         ...mockInitialState,
//         ml: {
//           ...mockInitialState.ml,
//           filters: {
//             ...mockInitialState.ml?.filters || {},
//             durationRange: { from: '1', to: '5' }
//           }
//         }
//       }
//       renderComponent(customState)
//       expect(screen.getByText('Reset')).toBeInTheDocument()
//     })
//   })

//   describe('Status Display', () => {
//     it('should display Active status as green', () => {
//       renderComponent()
//       const activeStatus = screen.getByText('Active')
//       expect(activeStatus).toHaveClass('bg-green-100')
//       expect(activeStatus).toHaveClass('text-green-800')
//     })

//     it('should display Draft status as yellow', () => {
//       renderComponent()
//       const draftStatus = screen.getByText('Draft')
//       expect(draftStatus).toHaveClass('bg-yellow-100')
//       expect(draftStatus).toHaveClass('text-yellow-800')
//     })
//   })

//   describe('Loading State', () => {
//     it('should show loading state when loading is true', () => {
//       const loadingState = {
//         ...mockInitialState,
//         ml: {
//           ...mockInitialState.ml,
//           loading: true
//         }
//       }
//       renderComponent(loadingState)
//       expect(screen.getByText(/Mirco Learning/i)).toBeInTheDocument()
//     })
//   })

//   describe('Empty State', () => {
//     it('should display empty message when no data', () => {
//       const emptyState = {
//         ...mockInitialState,
//         ml: {
//           ...mockInitialState.ml,
//           list: []
//         }
//       }
//       renderComponent(emptyState)
//       expect(screen.getByText('No Micro learning found')).toBeInTheDocument()
//     })
//   })

//   describe('Filter Actions', () => {
//     it('should render checkbox for each category', () => {
//       renderComponent()
//       const categoryCheckboxes = screen.getAllByRole('checkbox')
//       expect(categoryCheckboxes.length).toBeGreaterThan(0)
//     })

//     it('should apply filter when checkbox is clicked', async () => {
//       renderComponent()
//       const checkboxes = screen.getAllByRole('checkbox')
//       if (checkboxes.length > 0) {
//         fireEvent.click(checkboxes[0])
//         await waitFor(() => {
//           expect(checkboxes[0]).toBeInTheDocument()
//         })
//       }
//     })
//   })

//   describe('Navigation', () => {
//     it('should navigate to create page when Create ML is clicked', () => {
//       renderComponent()
//       const createButton = screen.getByRole('button', { name: /Create ML/i })
//       expect(createButton).toHaveAttribute('type', 'button')
//     })
//   })

//   describe('Language Selection', () => {
//     it('should render language filter options', () => {
//       renderComponent()
//       expect(screen.getByText('Language')).toBeInTheDocument()
//       expect(screen.getByText('English')).toBeInTheDocument()
//       expect(screen.getByText('Tamil')).toBeInTheDocument()
//     })
//   })

//   describe('Pagination', () => {
//     it('should display pagination info', () => {
//       renderComponent()
//       expect(screen.getByText(/1 - 2 of 2/)).toBeInTheDocument()
//     })

//     it('should display hasMore false when all items loaded', () => {
//       const noPaginationState = {
//         ...mockInitialState,
//         ml: {
//           ...mockInitialState.ml,
//           pagination: { page: 0, hasMore: false, total: 2 }
//         }
//       }
//       renderComponent(noPaginationState)
//       expect(screen.getByText(/1 - 2 of 2/)).toBeInTheDocument()
//     })
//   })

//   describe('Table Columns', () => {
//     it('should display ML ID column', () => {
//       renderComponent()
//       expect(screen.getByText(/Micro Learning ID/i)).toBeInTheDocument()
//     })

//     it('should display ML Title column', () => {
//       renderComponent()
//       expect(screen.getByText(/Micro Learning Title/i)).toBeInTheDocument()
//     })

//     it('should display Category column', () => {
//       renderComponent()
//       expect(screen.getByText('Category')).toBeInTheDocument()
//     })

//     it('should display Duration column', () => {
//       renderComponent()
//       expect(screen.getByText('Duration')).toBeInTheDocument()
//     })

//     it('should display Status column', () => {
//       renderComponent()
//       expect(screen.getByText(/Status/i)).toBeInTheDocument()
//     })
//   })

//   describe('Document Types Filter', () => {
//     it('should render document type checkboxes', () => {
//       renderComponent()
//       expect(screen.getByText('PDF')).toBeInTheDocument()
//       expect(screen.getByText('Video')).toBeInTheDocument()
//     })
//   })

//   describe('Utlity Functions', () => {
//     it('should format duration label correctly', () => {
//       renderComponent()
//       expect(screen.getByText(/Duration/i)).toBeInTheDocument()
//     })
//   })
// })
