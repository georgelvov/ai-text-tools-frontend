import React from 'react';
import { useTextProcessing } from '../hooks/useTextProcessing';
import { useApiRequest } from '../hooks/useApiRequest';

const withTextProcessing = (WrappedComponent, apiEndpoint, processData) => {
  return (props) => {
    const { makeRequest, loading, error } = useApiRequest();
    
    const processText = async () => {
      const data = await makeRequest(apiEndpoint, {
        method: 'POST',
        body: JSON.stringify(processData()),
      });
      
      if (data) {
        // Передаем результат обратно в компонент через props
        if (props.onProcessComplete) {
          props.onProcessComplete(data);
        }
      }
    };

    const textProcessingProps = useTextProcessing(processText);

    return (
      <WrappedComponent
        {...props}
        {...textProcessingProps}
        loading={loading}
        error={error}
      />
    );
  };
};

export default withTextProcessing; 