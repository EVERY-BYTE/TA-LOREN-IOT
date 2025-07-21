import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { Button, CardActionArea, CardActions } from '@mui/material'

export interface IProductCardModel {
  image: string
  title: string
  description: string
  price: number
}

export default function ProductCard(props: IProductCardModel) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia component='img' height='140' image={props.image} alt='product image' />
        <CardContent>
          <Typography gutterBottom variant='h5' component='div'>
            {props.title}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size='small' color='primary'>
          Share
        </Button>
      </CardActions>
    </Card>
  )
}
