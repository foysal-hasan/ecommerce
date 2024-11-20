import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Rating from "./Rating";

function Product({ product }) {
  // console.log(product.image);

  return (
    <Card className="my-3 p-3 rounded">
      <Link to={`/products/${product._id}`}>
        <Card.Img src={product.image} variant="top" />
      </Link>
      <Card.Body>
        <Link to={`/products/${product._id}`}>
          <Card.Title as={"div"} className="product-title">
            <strong className="text-black">{product.name}</strong>
          </Card.Title>
        </Link>
        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
        <Card.Text as={"h3"}>${product.price}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Product;
