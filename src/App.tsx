import { lazy, Suspense, useEffect, useState } from 'react'
import './App.css'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Xumm } from 'xumm';
import iconChevronLeft from './assets/chevron-left.png'
import { Error as ErrorComponent } from './Components/Error';
import * as Sentry from "@sentry/react";
import { XrplClient } from 'xrpl-client';
import rehypeRaw from 'rehype-raw'
import { checkIfTangemCardCanBePrefilled } from './Components/MainPage/MainNet';
import Hurray from './Components/MainPage/Hurray';

const queryClient = new QueryClient()

const MainNet = lazy(() => import('./Components/MainPage/MainNet'));
const DevNet = lazy(() => import('./Components/MainPage/DevNet'));
const Loader = lazy(() => import('./Components/MainPage/Loader'));

const searchParams = new URL(window.location.href).searchParams;
const xAppToken = searchParams.get('xAppToken') || '';
const xAppStyle = searchParams.get('xAppStyle')?.toLowerCase();

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_URL,
});

export default function App() {

  const [mainPage, setMainPage] = useState<any>();
  const [jwt, setJwt] = useState<string>();
  const [contentURL, setContentURL] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (contentURL == '') return;
    fetch(contentURL).then(res =>
      res.text()
    ).then(text => {
      setContent(text.replace(/^\{\%.*\%\}$/gm, ''));
    })
  }, [contentURL])

  // fetch(`/__log?${encodeURI(JSON.stringify(import.meta.env.VITE_XAPP_API_KEY, null, 4))}`);

  const xumm = new Xumm(import.meta.env.VITE_XAPP_API_KEY);
  useEffect(() => {
    let bearerFromSdk: string = '';
    setMainPage(<Loader />)
    xumm.environment.bearer?.then(async bearer => {
      bearerFromSdk = bearer;
      setJwt(bearer);

    }).then(() => {
      xumm.environment.ott?.then(async (profile: any) => {
        fetch(`/__log?${encodeURI(JSON.stringify(profile, null, 4))}`);
        let XRPLClient = null
        try {
          XRPLClient = new XrplClient(profile?.nodewss, { maxConnectionAttempts: 4 });
        } catch (e) {
          console.log(e);
        }
        if (XRPLClient === null) {
          setMainPage(<ErrorComponent xumm={xumm} text="Something went wrong. Please re-open the xApp and if this error keeps occurring, please send in a ticket via Xumm Support." />);;
          xumm?.xapp?.ready();
          return;
        }

        const [accountInfo, prefillCheck] = await Promise.all([
          XRPLClient.send({
            "command": "account_info",
            "account": profile?.account,
          }),
          checkIfTangemCardCanBePrefilled(bearerFromSdk, xAppToken, profile?.nodetype || '')
        ])

        if (accountInfo && accountInfo.account_data && !prefillCheck) {
          // Assume that account is found and therefore activated, so don't use xApp
          setMainPage(<Hurray xumm={xumm} xAppStyle={xAppStyle} />)
          xumm?.xapp?.ready();
          return;
        }
        switch (profile?.nodetype) {
          case 'MAINNET':
          case 'XAHAU':
            setMainPage(<MainNet nodetype={profile.nodetype} accountToActivate={profile?.account} toggleMarkdownURL={toggleMarkdownURL} xAppStyle={xAppStyle} profile={profile} xAppToken={xAppToken} bearer={bearerFromSdk} xumm={xumm} prefillCheck={prefillCheck} />);
            xumm?.xapp?.ready();
            return;
          case 'DEVNET':
          case 'TESTNET':
          case 'XAHAUTESTNET':
          case 'CUSTOM':
          case 'JSHOOKS':
            let networkName = `${profile?.nodetype.includes('XAHAU') ? 'XAHAU' : 'XRPL'} Testnet`;
            try {
              const railsData = await (await fetch('https://xumm.app/api/v1/platform/rails')).json();
              networkName = railsData[profile.nodetype].name;
            } catch (e) {
              Sentry.captureException(e);
            }
            setMainPage(<DevNet xAppStyle={xAppStyle} profile={profile} bearer={bearerFromSdk} xAppToken={xAppToken} xumm={xumm} networkName={networkName} />);
            xumm?.xapp?.ready();
            return;
          default:
            setMainPage(<ErrorComponent xumm={xumm} text="Something went wrong. Please re-open the xApp and if this error keeps occurring, please send in a ticket via Xaman Support." />);
            xumm?.xapp?.ready();
            return;
        }
      });
    });

  }, []);

  function test() {
    setMainPage(<Hurray xumm={xumm} xAppStyle={xAppStyle} />)
  }

  function toggleMarkdownURL(url: string) {
    setContentURL(url)
  }

  useEffect(() => {
    document.getElementById('overlayContent')?.addEventListener('click', function (event) {
      event.preventDefault();
      // @ts-ignore
      const targetElement = event.target?.closest('a');
      if (targetElement === null) return;
      let url: string = targetElement.getAttribute('href');
      if (url === null) return;
      if (/detect\/xapp\:xumm\.support/.test(url)) {
        xumm.xapp?.navigate({ xApp: 'xumm.support' })
      } else {
        url = url.replace('../../', 'https://help.xumm.app/app/');
        url = url.replace('../', 'https://help.xumm.app/app/');
        url = url.replace('.md', '');
        xumm.xapp?.openBrowser({ url: url })
      }
    })
  }, [contentURL])

  const transformImageUri = (input: string) =>
    /^https?:/.test(input)
      ? input
      : `https://raw.githubusercontent.com/XRPL-Labs/Help-Center/main/${input.replace(/\.\.\//gi, '')}`


  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <Suspense>
        <div className="flex gap-4 flex-col prose w-full">
          {contentURL !== '' ?
            <div id="overlayContent">
              {/* @ts-ignore */}
              <ReactMarkdown className='pb-24 pt-8 prose' linkTarget="_blank" rehypePlugins={[rehypeRaw]} transformImageUri={transformImageUri}>{content}</ReactMarkdown>
              <div className={`fixed left-0 max-h-[195px] ${xAppStyle === 'light' ? 'bg-theme-tint' : 'bg-[rgb(var(--themeColorBackgroundPrimary))]'} w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px]`}>
                <button onClick={() => setContentURL('')} className="button button--blue w-full py-[16px] rounded-[20px] flex items-center justify-center gap-2"><img className={`m-0 ${xAppStyle !== 'light' ? 'filter-white' : ''}`} src={iconChevronLeft} /><p className="m-0 text-primary ">Back</p></button>
              </div>
            </div>
            :
            mainPage
          }
        </div>
      </Suspense>
    </QueryClientProvider>
  )
}