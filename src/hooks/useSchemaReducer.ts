import { useReducer } from 'react'
import type {
  SchemaState,
  SchemaAction,
} from '../types/schema'
import {
  createDefaultField,
  getDefaultTypeOptions,
} from '../components/schema-builder/field-defaults'
import {
  createDefaultConstraint,
} from '../components/schema-builder/constraint-defaults'
export { exportSchema } from '../lib/exportSchema'

export const initialState: SchemaState = { fields: [], constraints: [] }

export function schemaReducer(state: SchemaState, action: SchemaAction): SchemaState {
  switch (action.type) {
    case 'ADD_FIELD': {
      const index = state.fields.length + 1
      return { ...state, fields: [...state.fields, createDefaultField(index)] }
    }

    case 'REMOVE_FIELD': {
      return {
        ...state,
        fields: state.fields.filter(f => f.id !== action.payload.id),
      }
    }

    case 'UPDATE_FIELD': {
      return {
        ...state,
        fields: state.fields.map(f =>
          f.id === action.payload.id
            ? { ...f, ...action.payload.updates }
            : f
        ),
      }
    }

    case 'UPDATE_TYPE': {
      return {
        ...state,
        fields: state.fields.map(f =>
          f.id === action.payload.id
            ? { ...f, type: action.payload.fieldType, typeOptions: getDefaultTypeOptions(action.payload.fieldType) }
            : f
        ),
      }
    }

    case 'SET_SCHEMA': {
      return {
        fields: action.payload.fields,
        constraints: action.payload.constraints ?? [],
      }
    }

    case 'ADD_CONSTRAINT': {
      const constraint = createDefaultConstraint(action.payload.constraintType, state.fields)
      return { ...state, constraints: [...state.constraints, constraint] }
    }

    case 'REMOVE_CONSTRAINT': {
      return {
        ...state,
        constraints: state.constraints.filter(c => c.id !== action.payload.id),
      }
    }

    case 'UPDATE_CONSTRAINT': {
      return {
        ...state,
        constraints: state.constraints.map(c =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.updates }
            : c
        ),
      }
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
