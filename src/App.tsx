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


  const xumm = new Xumm(import.meta.env.VITE_XAPP_API_KEY);
  useEffect(() => {
    let bearerFromSdk: string = '';
    xumm.environment.bearer?.then(bearer => {
      bearerFromSdk = bearer;
      setJwt(bearer);
    }).then(() => {
      xumm.environment.ott?.then(async profile => {
        fetch(`/__log?${encodeURI(JSON.stringify(profile, null, 4))}`);
        fetch(`/__log?${encodeURI(JSON.stringify(xAppToken, null, 4))}`);
        const XRPLClient = new XrplClient(profile?.nodewss);
        const accountInfo = await XRPLClient.send({
          "command": "account_info",
          "account": profile?.account,
        })
        // if (accountInfo && accountInfo.account_data) {
        //   // Assume that account is found and therefore activated, so don't use xApp
        //   setMainPage(<ErrorComponent title="Hurray!" text="This account is already activated. You can close the xApp and enjoy your Xumm account!" xumm={xumm} hideTicket={true} />)
        //   return;
        // }

        switch (profile?.nodetype) {
          case 'MAINNET':
          case 'XAHAU':
            setMainPage(<MainNet nodetype={profile.nodetype} accountToActivate={profile?.account} toggleMarkdownURL={toggleMarkdownURL} xAppStyle={xAppStyle} profile={profile} xAppToken={xAppToken} bearer={bearerFromSdk} xumm={xumm} />);
            return;
          case 'DEVNET':
          case 'TESTNET':
          case 'XAHAUTESTNET':
          case 'CUSTOM':
            setMainPage(<DevNet xAppStyle={xAppStyle} profile={profile} bearer={bearerFromSdk} xAppToken={xAppToken} xumm={xumm} />);
            return;
          default:
            setMainPage(<ErrorComponent xumm={xumm} text="Something went wrong. Please re-open the xApp and if this error keeps occurring, please send in a ticket via Xumm Support." />);
            return;
        }
      });
      xumm?.xapp?.ready();
    });

  }, []);

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
              <ReactMarkdown className='pb-24 pt-8' linkTarget="_blank" rehypePlugins={[rehypeRaw]} transformImageUri={transformImageUri}>{content}</ReactMarkdown>
              <div className="fixed left-0 max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px]">
                <button onClick={() => setContentURL('')} className="button button--blue text-black w-full py-[16px] rounded-[20px] flex items-center justify-center gap-2"><img className="m-0" src={iconChevronLeft} /><p className="m-0">Back</p></button>
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