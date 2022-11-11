import type { FunctionData } from '../models/Function';
import type { MapDefinitionEntry } from '../models/MapDefinition';
import type { Schema } from '../models/Schema';
import { SchemaType } from '../models/Schema';
import { convertFromMapDefinition } from '../utils/DataMap.Utils';
import { convertSchemaToSchemaExtended } from '../utils/Schema.Utils';
import { DataMapperWrappedContext } from './DataMapperDesignerContext';
import { setInitialDataMap, setInitialSchema, setXsltFilename } from './state/DataMapSlice';
import { loadFunctions } from './state/FunctionSlice';
import { setAvailableSchemas } from './state/SchemaSlice';
import type { AppDispatch } from './state/Store';
import React, { useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

export interface DataMapDataProviderProps {
  xsltFilename?: string;
  mapDefinition?: MapDefinitionEntry;
  sourceSchema?: Schema;
  targetSchema?: Schema;
  availableSchemas?: string[];
  fetchedFunctions?: FunctionData[];
  children?: React.ReactNode;
}

const DataProviderInner: React.FC<DataMapDataProviderProps> = ({
  xsltFilename,
  mapDefinition,
  sourceSchema,
  targetSchema,
  availableSchemas,
  fetchedFunctions,
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const extendedSourceSchema = useMemo(() => sourceSchema && convertSchemaToSchemaExtended(sourceSchema), [sourceSchema]);
  const extendedTargetSchema = useMemo(() => targetSchema && convertSchemaToSchemaExtended(targetSchema), [targetSchema]);

  useEffect(() => {
    dispatch(setXsltFilename(xsltFilename ?? ''));
  }, [dispatch, xsltFilename]);

  useEffect(() => {
    if (mapDefinition && extendedSourceSchema && extendedTargetSchema && fetchedFunctions) {
      const connections = convertFromMapDefinition(mapDefinition, extendedSourceSchema, extendedTargetSchema, fetchedFunctions);
      dispatch(
        setInitialDataMap({ sourceSchema: extendedSourceSchema, targetSchema: extendedTargetSchema, dataMapConnections: connections })
      );
    }
  }, [dispatch, mapDefinition, extendedSourceSchema, extendedTargetSchema, fetchedFunctions]);

  useEffect(() => {
    if (extendedSourceSchema) {
      dispatch(
        setInitialSchema({
          schema: extendedSourceSchema,
          schemaType: SchemaType.Source,
        })
      );
    }
  }, [dispatch, extendedSourceSchema]);

  useEffect(() => {
    if (extendedTargetSchema) {
      dispatch(
        setInitialSchema({
          schema: extendedTargetSchema,
          schemaType: SchemaType.Target,
        })
      );
    }
  }, [dispatch, extendedTargetSchema]);

  useEffect(() => {
    if (availableSchemas) {
      dispatch(setAvailableSchemas(availableSchemas));
    }
  }, [dispatch, availableSchemas]);

  useEffect(() => {
    if (fetchedFunctions) {
      dispatch(loadFunctions(fetchedFunctions ?? []));
    }
  }, [dispatch, fetchedFunctions]);

  return <>{children}</>;
};

export const DataMapDataProvider: React.FC<DataMapDataProviderProps> = (props) => {
  const wrapped = useContext(DataMapperWrappedContext);
  if (!wrapped) {
    throw new Error('DataMapDataProvider must be used inside of a DataMapperWrappedContext');
  }

  return <DataProviderInner {...props} />;
};
