import React, { useState } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

interface Interface {
  showReply: string;
  setShowReply: (value: string) => void;
}

function AddReplyBox({ showReply, setShowReply }: Interface) {
  const { id } = useParams();

  const queryClient = useQueryClient();
  const [value, setValue] = useState<string>('');

  const addReply = async (content: string) => axios.post('/api/replies', { boardId: id, commentId: showReply, content });
  const addReplyMutation = useMutation(addReply, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', { board: id }] });
      setValue('');
      setShowReply('');
    },
    onError: (error) => {
      throw error;
    },
  });
  const handleSubmit = (event: any) => {
    event.preventDefault();
    addReplyMutation.mutate(value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 lg:ml-12 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
          <textarea
            id="reply"
            rows={4}
            className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400 resize-none"
            placeholder="Write a reply..."
            required
            maxLength={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="items-center justify-between px-3 py-2 border-t dark:border-gray-600">
          <button
            type="submit"
            className="btn-primary"
          >
            Add reply
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setShowReply('');
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddReplyBox;
