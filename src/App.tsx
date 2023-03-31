import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Xumm } from 'xumm';
import MainNet from './Components/MainPage/MainNet';
import NotFound from './Components/MainPage/NotFound';
import DevNet from './Components/MainPage/DevNet';
import iconChevronRight from './assets/chevron-right.png'
import CustomNet from './Components/MainPage/CustomNet';
import NotAvailable from './Components/MainPage/NotAvailable';
import Loader from './Components/MainPage/Loader';

const queryClient = new QueryClient()

const searchParams = new URL(window.location.href).searchParams;
const xAppToken = searchParams.get('xAppToken') || '';

// fetch(`/__log?${encodeURI(xAppToken)}`)

export default function App() {

  const [markdownURL, setMarkdownURL] = useState<string | null>(null);
  const [mainPage, setMainPage] = useState<any>();

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
        <div className="fixed shadow-sm left-0 top-0 w-full bg-[rgb(var(--themeColorBackgroundPrimary))] py-2 px-4 border-b border-[rgb(var(--colorSilver))]" onClick={() => { setMarkdownURL(null); }}>
          <div className="flex gap-3 items-center">
            <img src={iconChevronRight} className="m-0 rotate-180 h-4" />
            <span className="font-bold">Back</span>
          </div>
        </div>
        <ReactMarkdown children={data || ''}></ReactMarkdown>
      </>
    );
  }

  function fundAccount(url: string, account: string) {
    if (account === '') return false;
    console.log(account);

    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: `{"destination": ${account}, "xrpAmount": "1010"}`,
      mode: 'no-cors'
    }).then((r) => {
      console.log(r);
      // fetch(`/__log?${encodeURI(JSON.stringify(r.text(), null, 4))}`)
    })
  }

  const xumm = new Xumm(import.meta.env.VITE_XAPP_API_KEY_DEV);
  useEffect(() => {
    alert(xAppToken);
    xumm.environment.ott?.then(profile => {

      // fetch(`/__log?${encodeURI(JSON.stringify(profile, null, 4))}`)
      switch (profile?.nodetype) {
        case 'MAINNET':
          setMainPage(<MainNet toggleMarkdownURL={toggleMarkdownURL} />);
          return;
        case 'DEVNET':
          fundAccount('https://faucet.devnet.rippletest.net/accounts', profile?.account || '')
          setMainPage(<DevNet />);
          return;
        case 'TESTNET':
          fundAccount('https://faucet.altnet.rippletest.net/accounts', profile?.account || '')
          setMainPage(<DevNet />);
          return;
        case 'CUSTOM':
          // fetch(`/__log?${encodeURI(JSON.stringify(profile, null, 4))}`)
          // If var nodewss contains 'hooks' and 'v3', users can automatically fund their account. Otherwise, they can't yet.
          if (profile?.nodewss.includes('hooks') && profile?.nodewss.includes('v3')) {
            fundAccount('https://faucet.devnet.rippletest.net/accounts', profile?.account || '')
            setMainPage(<CustomNet />)
          } else {
            setMainPage(<NotAvailable />);
          }
          return;
        default:
          setMainPage(<Loader />);
      }
    });
  }, []);

  function toggleMarkdownURL(url: string) {
    setMarkdownURL(url)
  }

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <div className="flex gap-4 flex-col prose">
        {markdownURL !== null ?
          <GetMarkdown url={markdownURL} />
          :
          mainPage
        }
      </div>
    </QueryClientProvider>
  )
}

/* Todo:

  - Add xAppToken to project + xumm sdk
  - Display choices based on network
  - Build each choice

  - Choices on mainnet:
    -> Voucher
      -> Hoe, wat waar wanneer?
    -> OnOffRamp
      -> xApp openen
    -> Exchange deposit instructies
      -> Kies exchange
      -> Laat instructies zien
      -> Gebruiker moet terug kunnen

  - Altnet
    -> Concept uitleggen -> WTF?

*/
