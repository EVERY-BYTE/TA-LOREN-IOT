import { Outlet } from 'react-router-dom'
import { useAppContext } from '../context/app.context'
import { Alert, AlertTitle, Snackbar, Stack } from '@mui/material'

const AuthLayout = () => {
  const { appAlert, setAppAlert } = useAppContext()

  return (
    <div>
      <Outlet />
      <Stack direction='row' justifyContent='flex-end' zIndex={10}>
        <Snackbar
          open={appAlert.isDisplayAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={5000}
          onClose={() => {
            setAppAlert({
              isDisplayAlert: false,
              message: '',
              alertType: undefined
            })
          }}
        >
          <Alert severity={appAlert.alertType}>
            <AlertTitle>{appAlert?.alertType?.toUpperCase()}</AlertTitle>
            {appAlert.message}
          </Alert>
        </Snackbar>
      </Stack>
    </div>
  )
}

export default AuthLayout
