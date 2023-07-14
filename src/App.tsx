import { lazy, Suspense, useEffect, useState } from 'react'
import './App.css'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Xumm } from 'xumm';
import iconChevronRight from './assets/chevron-right.png'
import iconChevronLeft from './assets/chevron-left.png'
import { XrplClient } from 'xrpl-client';

const queryClient = new QueryClient()

const MainNet = lazy(() => import('./Components/MainPage/MainNet'));
const DevNet = lazy(() => import('./Components/MainPage/DevNet'));
const Loader = lazy(() => import('./Components/MainPage/Loader'));

const searchParams = new URL(window.location.href).searchParams;
const xAppToken = searchParams.get('xAppToken') || '';
const xAppStyle = searchParams.get('xAppStyle')?.toLowerCase();

export default function App() {

  const [markdownURL, setMarkdownURL] = useState<string | null>(null);
  const [mainPage, setMainPage] = useState<any>();
  const [jwt, setJwt] = useState<string>();

  function GetMarkdown(url: any) {
    const { isLoading, error, data } = useQuery('repoData', () =>
      fetch(url?.url).then(res =>
        res.text()
      )
    )

    if (isLoading) return (<p>Loading...</p>);
    if (error) return (<p>'An error has occurred: ' + error</p>)
    return (
      <>
        <ReactMarkdown children={data || ''}></ReactMarkdown>
      </>
    );
  }


  const xumm = new Xumm(import.meta.env.VITE_XAPP_API_KEY);
  fetch(`/__log?${encodeURI(JSON.stringify(xAppToken, null, 4))}`)
  useEffect(() => {
    let bearerFromSdk: string = '';
    xumm.environment.bearer?.then(bearer => {
      bearerFromSdk = bearer;
      setJwt(bearer);
    }).then(() => {
      xumm.environment.ott?.then(async profile => {
        // fetch(`/__log?${encodeURI(JSON.stringify(profile, null, 4))}`)
        switch (profile?.nodetype) {
          case 'MAINNET':
            setMainPage(<MainNet toggleMarkdownURL={toggleMarkdownURL} xAppStyle={xAppStyle} profile={profile} xAppToken={xAppToken} bearer={bearerFromSdk} xumm={xumm} />);
            return;
          case 'DEVNET':
          case 'TESTNET':
          case 'CUSTOM':
            setMainPage(<DevNet xAppStyle={xAppStyle} profile={profile} bearer={bearerFromSdk} xAppToken={xAppToken} xumm={xumm} />);
            return;
          default:
            setMainPage(<Loader />);
        }
      });
    });

  }, []);

  function toggleMarkdownURL(url: string) {
    setMarkdownURL(url)
  }

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <Suspense>
        <div className="flex gap-4 flex-col prose">
          {markdownURL !== null ?
            <>
              <GetMarkdown url={markdownURL} />
              <div className="fixed left-0 max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px]">
                <button onClick={() => setMarkdownURL(null)} className="button button--blue text-black w-full py-[16px] rounded-[20px] flex items-center justify-center gap-2"><img className="m-0" src={iconChevronLeft} /><p className="m-0">Back</p></button>
              </div>
            </>
            :
            mainPage
          }
        </div>
      </Suspense>
    </QueryClientProvider>
  )
}

/* Todo:

  - Show/hide on/offramp based on eligible

  - Move logic for filling tangem's to MainNet component
  - Move logic for filling acconuts on test/dev to DevNet component

*/
