import React, { useState } from "react";
import "./Auth.css";
import axios from "../utils/api-interceptor";
import { useDispatch } from "react-redux";
import LoginImage from "../../media/login.jpeg";
import { Card, CardContent, TextField, Button } from "@mui/material"
import { setLogin } from "./userSlice";
import { useNavigate, Link } from 'react-router-dom';


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ "username": "", "password": "" })

  const handleSubmit = async () => {
    await axios
      .post("/api/auth/login", {
        ...formData
      })
      .then((response) => {
        if (response.status === 200) {
          // window.localStorage.setItem("token", response.data.token);
          // window.localStorage.setItem("username", values.username);
          dispatch(setLogin({ ...formData, 'authenticated': true }));
          navigate("/projects");
        }
      })
      .catch((error) => {
        if (error.response.status === 409) {
          console.log('error', error.response.data.error)
          // setAlertText(error.response.data.error);
          // setShowAlert(true);
        }
      });
  };

  return (
    <Card>
      <CardContent>
        <TextField
          // error
          id="outlined-error"
          // label="Error"
          value={formData.username}
          placeholder="Username"
          onChange={(e) => setFormData({ ...formData, "username": e.target.value })}
        />
        <TextField
          // error
          id="outlined-error"
          // label="Error"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, "password": e.target.value })}
          placeholder="Password"
        />
        <Button onClick={() => handleSubmit()}>Login</Button>
        {/* <Card.Title>Login to LexiClean</Card.Title> */}
        {/* <Formik
            validationSchema={schema}
            onSubmit={(values) => handleSubmit(values)}
            initialValues={{
              username: "",
              password: "",
            }}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              isValid,
              errors,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Row>
                  <Form.Group as={Col} md="12" controlId="validationFormik01">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Username"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      autoComplete="off"
                      isValid={touched.username && !errors.username}
                      isInvalid={touched.username && errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} md="12" controlId="validationFormik03">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      autoComplete="off"
                      isValid={touched.password && !errors.password}
                      isInvalid={touched.password && errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Button variant="dark" type="submit">
                  Login
                </Button>
              </Form>
            )}
          </Formik> */}
      </CardContent>
      <Link to="/">
        return to landing page
      </Link>
    </Card>
  );
};

export default Login