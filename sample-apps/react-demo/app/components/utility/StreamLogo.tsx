import Image from 'next/image';
import logo from '../../icon.svg';

export const StreamLogo = () => (
  <Image src={logo} alt="Stream" height={28} width={50} priority />
);
