import React, { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import EditFrame from '../../editFrame';

interface Interface {
  defaultValue: string;
  showModify: string;
  setShowModify: (value: string) => void;
}

function EditCommentBox({ defaultValue, showModify, setShowModify } : Interface) {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [value, setValue] = useState<string>(defaultValue);

  const updateComment = async (content: string) => axios.put(`/api/comments/${showModify}`, {
    content,
  });
  const updateCommentMutation = useMutation(updateComment, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', { board: id }] });
      setShowModify('');
      setValue('');
    },
    onError: (err) => {
      throw err;
    },
  });

  const handleSubmit = (event: any) => {
    event.preventDefault();
    updateCommentMutation.mutate(value);
  };

  return (
    <EditFrame
      handleSubmit={handleSubmit}
      type="comment"
      value={value}
      setValue={setValue}
      cancelFunc={() => {
        setShowModify('');
        setValue('');
      }}
    />
  );
}

export default EditCommentBox;
