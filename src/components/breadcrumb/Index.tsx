/* eslint-disable @typescript-eslint/no-explicit-any */
import { emphasize, styled } from '@mui/material/styles'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Chip from '@mui/material/Chip'

interface IBreadCrumberItemType {
  label: string
  link?: string
  icon?: any
}

interface IBreadCrumberType {
  navigation: IBreadCrumberItemType[]
}

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800]
  return {
    backgroundColor,
    height: theme.spacing(1),
    paddingRight: 2,
    paddingLeft: 2,
    paddingBottom: 12,
    paddingTop: 12,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06)
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12)
    }
  }
}) as typeof Chip

const BreadCrumberStyle = ({ navigation }: IBreadCrumberType) => {
  return (
    <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
      {navigation.map((item: IBreadCrumberItemType, index: number) => (
        <StyledBreadcrumb
          key={index}
          component='a'
          href={item.link}
          label={item.label}
          icon={item.icon ?? ''}
        />
      ))}
    </Breadcrumbs>
  )
}

export default BreadCrumberStyle
