import { useReducer } from 'react'
import type {
  SchemaState,
  SchemaAction,
} from '../types/schema'
import {
  createDefaultField,
  getDefaultTypeOptions,
} from '../components/schema-builder/field-defaults'
export { exportSchema } from '../lib/exportSchema'

export const initialState: SchemaState = { fields: [] }

export function schemaReducer(state: SchemaState, action: SchemaAction): SchemaState {
  switch (action.type) {
    case 'ADD_FIELD': {
      const index = state.fields.length + 1
      return { fields: [...state.fields, createDefaultField(index)] }
    }

    case 'REMOVE_FIELD': {
      return {
        fields: state.fields.filter(f => f.id !== action.payload.id),
      }
    }

    case 'UPDATE_FIELD': {
      return {
        fields: state.fields.map(f =>
          f.id === action.payload.id
            ? { ...f, ...action.payload.updates }
            : f
        ),
      }
    }

    case 'UPDATE_TYPE': {
      return {
        fields: state.fields.map(f =>
          f.id === action.payload.id
            ? { ...f, type: action.payload.fieldType, typeOptions: getDefaultTypeOptions(action.payload.fieldType) }
            : f
        ),
      }
    }

    case 'SET_SCHEMA': {
      return { fields: action.payload.fields }
    }

    default: {
      // Exhaustive check: TypeScript will error here if a new SchemaAction variant
      // is added without a matching case, preventing silent runtime failures.
      const _exhaustive: never = action
      void _exhaustive
      return state
    }
  }
}


export function useSchemaReducer() {
  const [state, dispatch] = useReducer(schemaReducer, initialState)
  return { state, dispatch }
}
