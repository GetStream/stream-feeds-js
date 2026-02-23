import Image from 'next/image';
import logo from '../../icon.svg';

export const StreamLogo = () => (
  <Image src={logo} alt="Stream" height={24} width={0} className="h-6 w-auto" priority />
);
