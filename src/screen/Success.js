import React from 'react';

import axios from 'axios';
import queryString from 'query-string';
import Button from '@material-ui/core/Button';

import ReactDataGrid from "react-data-grid";
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code : "",
            products:[],
            columns : [
              { name: 'Name', key: 'seller_sku', fronzen: true, width:300, sortDescendingFirst: true, resizable: true},
              { name: 'Current Price', key: 'product_price', fronzen: true, width: 150, resizable: true},
              { name: 'Cost', key: 'product_cost', width: 150, editable: true, resizable: true},
            ],
            accessToken : sessionStorage.getItem("accesstoken"),
            userId : sessionStorage.getItem("userid"),
            isLoading : true,
            totalDB : 0,
            totalLAZ : 0
          };
    }
    componentDidMount() {
      if (sessionStorage.getItem("accesstoken") && sessionStorage.getItem("userid")) {
        this.loopThroughProducts();
      }
      else {
        this.checkCode();
      }
    }

    checkCode = async() => {
      await this.setState({isLoading : "Checking your authorization"});
      let url = "https://manutzsong-laz.ddns.net/python-sv/getaccess";
      
      const {code} = queryString.parse(this.props.location.search);
      console.log(code);

      url += `?code=${code}`; 
      axios.get(url).then( async(response) => {
        // console.log(response.data.);
        if (response.data && response.data.access_token) {
          console.log(response.data);
          sessionStorage.setItem('accesstoken', response.data.access_token);
          sessionStorage.setItem('userid', response.data.country_user_info[0].user_id);
          await this.setState({accessToken : response.data.access_token, userId : response.data.country_user_info.user_id});
          this.loopThroughProducts();
        }
        else {
          //fail
        }
      });
    }

    loopThroughProducts = async() => {
      await this.setState({isLoading : "Get product list"});
      let url = `https://manutzsong-laz.ddns.net/python-sv/getproducts?accesstoken=${this.state.accessToken}`; 
      let products = await axios.get(url);
      console.log(products.data.data.products);
      products = products.data.data.products.map(x => x.skus);
      console.log(products);
      products = products.flat();
      console.log(products);
      let productSameAsDB = [];
      products.forEach(x => {
        let pushThis = {
          lazada_sku : x.ShopSku,
          seller_sku : x.SellerSku,
          product_cost : 0,
          product_url : x.Url,
          product_img : x.Images[0],
          product_price : x.special_price ? x.special_price : x.price
        }
        productSameAsDB.push(pushThis);
      });

      let productsFromDB = await axios.post("https://manutzsong-laz.ddns.net/node-sv/laz_product");
      console.log(productsFromDB.data);
      // //LAZ_SKU from DB
      let LAZ_SKU = [];
      let LAZ_Products = productsFromDB.data;
      productsFromDB.data.forEach( x => {
        LAZ_SKU.push(x.lazada_sku);
      });

      

      //Mapping things out from LAZ API
      // let nameProducts =  products.data.data.products.map(x => x.attributes.name);



      await this.setState({totalDB : LAZ_SKU.length, totalLAZ : productSameAsDB.length});

      for (let i=0;i<=productSameAsDB.length;i++) {
        try {
          //remove maching with LAZ_SKU
          if (LAZ_SKU.includes(productSameAsDB[i]["lazada_sku"])) {
            let addThisProduct = LAZ_Products.find(z => z["lazada_sku"] === productSameAsDB[i]["lazada_sku"]);
            productSameAsDB[i] = addThisProduct;
          }
        }
        catch(err) {

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
      await this.setState({products : productSameAsDB, isLoading : false});
    }


    loopProductsRender = () => {
      let renderThis = this.state.products.map(x => {
        return <div>{x.SellerSku} {x.price}</div>
      });

      return <div>{renderThis}</div>;
    }

    saveInsert = () => {
      console.log(this.state.userId, sessionStorage.getItem("userid"));
      // this.setState({isLoading : "Saving your progress"});
      // console.log(this.state.products);
      axios({
        method: 'post',
        url: 'https://manutzsong-laz.ddns.net/node-sv/insert',
        data: { products : this.state.products, userid : this.state.userId || sessionStorage.getItem("userid")}
      }).then( res => {
        console.log(res.data);
        // this.props.history.push('/app');
        window.location.replace("https://manutzsong-laz.ddns.net");
      });
      
    }

    onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
      this.setState(state => {
        const rows = state.products.slice();
        for (let i = fromRow; i <= toRow; i++) {
          rows[i] = { ...rows[i], ...updated };
        }
        return {products : rows };
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
              rowsCount={this.state.products.length+1}
              onGridRowsUpdated={this.onGridRowsUpdated}
              enableCellSelect={true}
              minHeight={600}
            />
            
          </div>
      </div>);
    }
}
