"use server";

import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";
import { postSchema } from "./schemas/blog";
import { Id } from "@/convex/_generated/dataModel";

export async function getImageUploadUrlAction() {
  const token = await getToken();
  const imageUrl = await fetchMutation(
    api.posts.generateImageUploadUrl,
    {},
    { token },
  );
  return imageUrl;
}

export async function createBlogAction(
  values: Omit<z.infer<typeof postSchema>, "image"> & {
    storageId: Id<"_storage">;
  },
) {
  try {
    const token = await getToken();

    await fetchMutation(
      api.posts.createPost,
      {
        body: values.content,
        title: values.title,
        imageStorageId: values.storageId,
      },
      { token },
    );
  } catch (error) {
    return { error: "Failed to create post" };
  }

  revalidatePath("/blog");
  return redirect("/blog");
}
