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
const TangemPreFilled = lazy(() => import('./Components/MainPage/TangemPreFilled'));

const searchParams = new URL(window.location.href).searchParams;
const xAppToken = searchParams.get('xAppToken') || '';

// fetch(`/__log?${encodeURI(xAppToken)}`)

export default function App() {

  const [markdownURL, setMarkdownURL] = useState<string | null>(null);
  const [mainPage, setMainPage] = useState<any>();
  const [jwt, setJwt] = useState<string>();
  const [isPrefilling, setIsPrefilling] = useState<boolean>(false);

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

  async function fundAccount(bearer: string, account: string, wss: string) {
    if (account === '') return false;
    let isPrefilled = false;
    await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${xAppToken}/auto`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      }
    })

    const XRPLClient = new XrplClient('wss://s.devnet.rippletest.net:51233');
    await XRPLClient.send({
      "command": "account_info",
      "account": account,
    }).then(response => {
      if (response && response.account_data.Balance > 10000) {
        setMainPage(<DevNet isPrefilling={false} />);
        isPrefilled = true;
      }
    })

    return isPrefilled;
  }

  async function checkIfTangemCardCanBePrefilled(bearer: string) {
    let canBePrefilled = false
    let check = fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${xAppToken}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json()).then(r => {
      fetch(`/__log?${encodeURI(JSON.stringify(r, null, 4))}`)

      if (r.eligible === true) {
        canBePrefilled = true;
      }
    });

    return canBePrefilled;
  }

  async function prefillTangemCard(bearer: string) {
    const prefillRequest = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      }
    })
    fetch(`/__log?${encodeURI(JSON.stringify(await prefillRequest.json(), null, 4))}`)
  }

  const xumm = new Xumm(import.meta.env.VITE_XAPP_API_KEY);
  fetch(`/__log?${encodeURI(JSON.stringify(xAppToken, null, 4))}`)
  useEffect(() => {
    let bearerFromSdk: string = '';
    xumm.environment.bearer?.then(bearer => {
      fetch(`/__log?${encodeURI(JSON.stringify(bearer, null, 4))}`)
      bearerFromSdk = bearer;
      setJwt(bearer);
    })
    xumm.environment.ott?.then(async profile => {
      fetch(`/__log?${encodeURI(JSON.stringify(profile, null, 4))}`)
      switch (profile?.nodetype) {
        case 'MAINNET':
          if (profile.accounttype === 'TANGEM') {
            // prefillTangemCard(bearerFromSdk);
            if (await checkIfTangemCardCanBePrefilled(bearerFromSdk)) {
              setMainPage(<TangemPreFilled />)
            } else {
              setMainPage(<MainNet toggleMarkdownURL={toggleMarkdownURL} />);
            }
          } else {
            setMainPage(<MainNet toggleMarkdownURL={toggleMarkdownURL} />);
          }
          return;
        case 'DEVNET':
        case 'TESTNET':
        case 'CUSTOM':
          setMainPage(<DevNet isPrefilling={true} />);
          let prefill = await fundAccount(bearerFromSdk, profile.account || '', profile.nodewss || '')
          fetch(`/__log?${encodeURI(JSON.stringify(prefill, null, 4))}`)
          if (prefill)
            window.setTimeout(() => {
              xumm.xapp?.close();
            }, 5000)
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
