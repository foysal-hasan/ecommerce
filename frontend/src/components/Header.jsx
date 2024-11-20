import { Badge, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FaCartArrowDown, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authSlice";
import { resetCart } from "../slices/cartSlice";
import { Link } from "react-router-dom";
import SearchBox from "./SearchBox";
function Header() {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const userInfo = useSelector((state) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const handleLogout = async () => {
    await logoutApi().unwrap();
    dispatch(resetCart());
    dispatch(logout());
  };
  return (
    <header>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        collapseOnSelect
        className="py-4"
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Foysal Store</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <SearchBox />
              <LinkContainer to="/cart">
                <Nav.Link>
                  <FaCartArrowDown />
                  Cart
                  {cartItems.length > 0 && (
                    <Badge pill bg="success" style={{ marginLeft: "5px" }}>
                      {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id="username">
                    <NavDropdown.Item as={Link} to="/profile">
                      Profile
                    </NavDropdown.Item>

                    {userInfo.isAdmin && (
                      <>
                        <LinkContainer to="/admin/productlist">
                          <NavDropdown.Item> Products</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/orderlist">
                          <NavDropdown.Item>Orders</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/userlist">
                          <NavDropdown.Item>Users</NavDropdown.Item>
                        </LinkContainer>
                      </>
                    )}

                    <NavDropdown.Item onClick={handleLogout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <Nav.Link as={Link} to="/login">
                  <FaUser /> Sign In
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
