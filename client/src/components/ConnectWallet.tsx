import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';

export const ConnectWallet: FC = () => {
  const wallet = useTonWallet();

  if (!wallet) {
    return (
      <div>
        <TonConnectButton className='ton-connect-page__button'/>
      </div>
    )
  }
}