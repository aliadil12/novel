












import { FaFacebook, FaTwitter, FaInstagram, FaTelegram } from 'react-icons/fa'

const iconMap = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  telegram: FaTelegram,
}

interface SocialIconProps {
  name: keyof typeof iconMap
  className?: string
  [key: string]: any
}

export default function SocialIcon({ name, ...props }: SocialIconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    return null
  }

  return (
    <IconComponent
      className={`text-gray-600 hover:text-amber-600 transition-colors ${props.className || ''}`}
      {...props}
    />
  )
}












