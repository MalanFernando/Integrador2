export async function compartirEvento({ id, titulo }: { id: string; titulo: string }): Promise<void> {
  const url = `${window.location.origin}/eventos/${id}`;
  if (navigator.share) {
    await navigator.share({ title: titulo, url });
  } else {
    await navigator.clipboard.writeText(url);
  }
}
