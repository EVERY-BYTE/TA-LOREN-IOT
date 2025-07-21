/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface IModalTypes {
  handleModal: () => void
  handleModalOnCancel: () => void
  message: string
  openModal: boolean
}

export default function ModalStyle({
  handleModal,
  handleModalOnCancel,
  openModal,
  message
}: IModalTypes) {
  return (
    <React.Fragment>
      <Dialog
        open={openModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleModal}
        aria-describedby='alert-dialog-slide-description'
      >
        <DialogTitle>{'Harap Konfirmasi!'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-slide-description'>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalOnCancel}>Cancel</Button>
          <Button onClick={handleModal}>Ok</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
