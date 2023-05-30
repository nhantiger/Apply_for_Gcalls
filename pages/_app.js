import "@/styles/globals.css";
import DefaultLayout from "@/layout/DefaultLayout";

export default function App({ Component, pageProps }) {
  return (
    <DefaultLayout>
      <Component {...pageProps} />
    </DefaultLayout>
  );
}
