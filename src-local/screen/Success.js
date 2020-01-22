import React from 'react';

import axios from 'axios';
import queryString from 'query-string';
import Button from '@material-ui/core/Button';

import ReactDataGrid from "react-data-grid";
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
const urlAPI = "https://manutzsong-laz.duckdns.org/node-sv"
// const urlAPI = "http://localhost:3002"
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
      products: [],
      columns: [
        { name: 'Name', key: 'seller_sku', fronzen: true, width: 300, sortDescendingFirst: true, resizable: true },
        { name: 'Current Price', key: 'product_price', fronzen: true, width: 150, resizable: true },
        { name: 'Cost', key: 'product_cost', width: 150, editable: true, resizable: true },
      ],
      accessToken: sessionStorage.getItem("accesstoken"),
      userId: sessionStorage.getItem("userid"),
      isLoading: true,
      totalDB: 0,
      totalLAZ: 0
    };
  }
  componentDidMount() {
    if (sessionStorage.getItem("accesstoken") && sessionStorage.getItem("userid")) {
      this.loopThroughProducts();
    }
    else {
      this.checkChromeToken();
    }
  }

  checkChromeToken = () => {
    const checkAccess = (license) => {
      var licenseStatus;
      if (license.result && license.accessLevel == "FULL") {
        console.log("Fully paid & properly licensed.");
        licenseStatus = "FULL";
      } else if (license.result && license.accessLevel == "FREE_TRIAL") {
        var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
        daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
        console.log(license.createdTime);
        if (daysAgoLicenseIssued <= 3) {
          console.log("Free trial, still within trial period");
          licenseStatus = "FREE_TRIAL";

        } else {
          console.log("Free trial, trial period expired.");
          licenseStatus = "FREE_TRIAL_EXPIRED";
        }
      } else {
        console.log("No license ever issued.");
        licenseStatus = "NONE";
      }
      return licenseStatus;
    }

    const { chromeToken } = queryString.parse(this.props.location.search);
    if (chromeToken) {
      var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
      axios.get(CWS_LICENSE_API_URL + "ojdacaeifolmomdnjodfmojipkmkboii", { headers: { "Authorization": `Bearer ${chromeToken}` } }).then(response => {
        console.log(response);
        var license = (response.data);
        console.log(license);
        let licenseStatus = checkAccess(license);
        if (licenseStatus === "FREE_TRIAL" || licenseStatus === "FULL") {
          this.checkCode();
        }
        else {
          console.log(licenseStatus);
          alert("NO ACCESS");
          window.location = "/";
        }
      });
    }
    else {
      alert("NO ACCESS");
      window.location = "/";
    }
  }



  checkCode = async () => {
    await this.setState({ isLoading: "Checking your authorization" });
    let url = `${urlAPI}/login`;
    console.log(url);

    const { code } = queryString.parse(this.props.location.search);
    console.log(code);

    axios.post(url, { accessCode: code }).then(async (response) => {
      console.log(response.data);
      if (response.data && response.data.access_token) {
        console.log(response.data);
        sessionStorage.setItem('accesstoken', response.data.access_token);
        sessionStorage.setItem('userid', response.data.country_user_info[0].user_id);
        sessionStorage.setItem('responseuserdata', btoa(JSON.stringify(response.data)));
        await this.setState({ accessToken: response.data.access_token, userId: response.data.country_user_info.user_id });
        this.loopThroughProducts();
      }
      else {
        //fail
      }
    });
  }

  loopThroughProducts = async () => {
    await this.setState({ isLoading: "Get product list" });
    let url = `${urlAPI}/getproducts`;
    let products = await axios.post(url, { accessToken: this.state.accessToken });
    console.log(products);
    products = products.data.flatMap(x => x.products).map(z => z.skus);
    console.log(products);
    products = products.flat();
    console.log(products);
    let productSameAsDB = [];
    products.forEach(x => {
      let pushThis = {
        lazada_sku: x.ShopSku,
        seller_sku: x.SellerSku,
        product_cost: 0,
        product_url: x.Url,
        product_img: x.Images[0],
        product_price: x.special_price ? x.special_price : x.price,
        product_family: `${x.color_family ? x.color_family : ""} ${x.size ? x.size : ""}`
      }
      console.log(pushThis.product_family, x.color_family, x);
      productSameAsDB.push(pushThis);
    });

    let productsFromDB = await axios.post(`${urlAPI}/laz_product`, { greaseUserID: sessionStorage.getItem("userid") });
    console.log(productsFromDB.data);
    // //LAZ_SKU from DB
    let LAZ_SKU = [];
    let LAZ_Products = productsFromDB.data;
    productsFromDB.data.forEach(x => {
      LAZ_SKU.push(x.lazada_sku);
    });



    //Mapping things out from LAZ API
    // let nameProducts =  products.data.data.products.map(x => x.attributes.name);



    await this.setState({ totalDB: LAZ_SKU.length, totalLAZ: productSameAsDB.length });

    for (let i = 0; i <= productSameAsDB.length; i++) {
      try {
        //remove maching with LAZ_SKU
        if (LAZ_SKU.includes(productSameAsDB[i]["lazada_sku"])) {
          let addThisProduct = LAZ_Products.find(z => z["lazada_sku"] === productSameAsDB[i]["lazada_sku"]);
          productSameAsDB[i] = addThisProduct;
        }
      }
      catch (err) {

      }

      // remove maching with LAZ_SKU

    };


    // pro.forEach(x => {
    //   console.log(x);
    // });

    console.log("B4", productSameAsDB[0]);
    productSameAsDB.sort(function (a, b) {
      return a.seller_sku.localeCompare(b.seller_sku);
    });

    // console.log(skus,pro);

    await this.setState({ products: productSameAsDB});
    const { addon, chrome_path } = queryString.parse(this.props.location.search);
    if (addon) {
      axios({
        method: 'post',
        url: `${urlAPI}/insert`,
        data: { products: this.state.products, userid: this.state.userId || sessionStorage.getItem("userid") }
      }).then(res => {
        console.log(res.data);
        // this.props.history.push('/app');
        window.location = `${chrome_path}?userid=${sessionStorage.getItem("userid")}&userdata=${sessionStorage.getItem("responseuserdata")}`;
      });
    }
    else {//original web view
      await this.setState({isLoading: false });
    }
  }


  loopProductsRender = () => {
    let renderThis = this.state.products.map(x => {
      return <div>{x.SellerSku} {x.price}</div>
    });

    return <div>{renderThis}</div>;
  }

  saveInsert = () => {
    console.log(this.state.userId, sessionStorage.getItem("userid"));
    this.setState({ isLoading: "Saving your progress" });
    console.log(this.state.products);
    axios({
      method: 'post',
      url: `${urlAPI}/insert`,
      data: { products: this.state.products, userid: this.state.userId || sessionStorage.getItem("userid") }
    }).then(res => {
      console.log(res.data);
      // this.props.history.push('/app');
      window.location.replace("https://manutzsong-laz.duckdns.org");
    });

  }

  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    this.setState(state => {
      const rows = state.products.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { products: rows };
    });
  };




  render() {
    if (this.state.isLoading) {
      return <div className="container d-flex vh-100 justify-content-center">
        <div className="align-self-center align-items-center d-flex">
          <div>
            <CircularProgress />
          </div>
          <div className="px-3">
            <h4>{this.state.isLoading}</h4>
          </div>
        </div>
      </div>
    }
    return (<div className="">
      <div className="d-flex align-items-center justify-content-center p-5 flex-column">
        <Button className="py-3" variant="contained" color="primary" onClick={() => this.saveInsert()}>
          Save , Proceed
            </Button>

        <Divider />
        <div className="pt-3">
          <p className="text-warning bg-dark">Edit cost if you want, else proceed.</p>
          <Divider />
          <h6>Total Products : {this.state.totalLAZ}</h6>
          <h6>Newly added products : {this.state.totalDB}</h6>
        </div>

      </div>
      <div className="container">
        <ReactDataGrid
          columns={this.state.columns}
          rowGetter={i => this.state.products[i]}
          rowsCount={this.state.products.length + 1}
          onGridRowsUpdated={this.onGridRowsUpdated}
          enableCellSelect={true}
          minHeight={600}
        />

      </div>
    </div>);
  }
}
