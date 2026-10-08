import DetailPage from "@/features/posts/pages/DetailPage";

export default function Page({ params }: Readonly<{ params: Promise<{ postId: string }> }>) {
  return <DetailPage params={params} />;
}