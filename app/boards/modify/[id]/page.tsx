'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

import { useParams, redirect, useRouter } from 'next/navigation';
import { Board } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BoardDetail from '@/app/boards/view/[id]/components/skeleton';
import AlertBox from '@/app/components/common/alertBox';
import { CreateBoard } from '@/app/types/Board';

async function getBoard(id: string) {
  const { data } = await axios.get(`/api/boards/${id}`);
  return data;
}

function Index() {
  const { id } = useParams();
  const router = useRouter();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const { isLoading, error, data } = useQuery<Board>({
    queryKey: ['boards', id],
    queryFn: () => getBoard(id),
    keepPreviousData: true,
    staleTime: 5000,
  });

  const queryClient = useQueryClient();
  const updateBoard = async (board: CreateBoard) => axios.put(`/api/boards/${id}`, board);
  const updateBoardMutation = useMutation(updateBoard, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', id] });
      router.push(`/boards/view/${id}`);
    },
    onError: (err) => {
      throw err;
    },
  });

  const [title, setTitle] = useState<string>(data?.title!);
  const [description, setDescription] = useState<string>(data?.description!);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    updateBoardMutation.mutate({
      title,
      description,
    });
  };

  if (isLoading) {
    return <BoardDetail />;
  }

  if (error) {
    return <AlertBox />;
  }

  if (session?.user?.email !== data?.email) {
    // 다른 사람 게시글 수정 들어갈 경우 로그인 페이지로 이동시키기.
    router.push('/signin');
  }

  if (data) {
    return (
      <div className="p-5">

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</p>
              <input
                type="text"
                id="title"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                maxLength={30}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </div>
          <div className="mb-6">
            <label htmlFor="description">
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</p>
              <textarea
                id="description"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Write your descriptions here..."
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
        </form>
      </div>
    );
  }
}

export default Index;
