/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const like = await prisma?.like.count({
      where: {
        boardId: id,
      },
    });

    let clicked = null;
    const currentUser = await getCurrentUser();
    if (currentUser) {
      clicked = await prisma?.like.findFirst({
        where: {
          boardId: id,
          userId: currentUser.id,
        },
      });
    }

    const data = {
      like,
      clicked: !!clicked,
    };
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
}
