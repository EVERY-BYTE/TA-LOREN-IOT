/* eslint-disable @typescript-eslint/no-explicit-any */
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { Box } from '@mui/material'

export interface ITableTypes {
  data: any[]
  rows: any[]
  page: number
  rowsPerPage: number
  handleChangePage: (event: unknown, newPage: number) => void
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void
  tableOption?: any
}

export default function TableStyle(props: ITableTypes) {
  const {
    data = [],
    rows = [],
    page = 0,
    rowsPerPage = 5,
    handleChangePage,
    handleChangeRowsPerPage,
    tableOption
  } = props

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Box my={2}>{tableOption}</Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label='sticky table'>
          <TableHead>
            <TableRow>
              {rows.map((header, index) => {
                return (
                  <TableCell
                    key={index}
                    align={'left'}
                    style={{
                      fontSize: 'medium',
                      fontWeight: 'bold'
                    }}
                  >
                    {header.title}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => {
              return (
                <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                  {rows.map((row, id) => row.data(item, id))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component='div'
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}
