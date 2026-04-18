import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/graphql/client';
import { Layout } from '@/components/layout/Layout';
import { CharactersPage } from '@/pages/CharactersPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CharactersPage />} />
            <Route path="/character/:id" element={<CharactersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}
