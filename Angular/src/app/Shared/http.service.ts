import {Injectable} from '@angular/core';
import {Http, Response, Headers} from "@angular/http";
import 'rxjs/Rx';



@Injectable()
export class HttpService {

  constructor(private http: Http) {}

  getModelData(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.get('http://localhost:3000/getModel')
      .map((response: Response) =>response._body);  
  }
//   verifyStock(query: any) {
//     console.log("Verify Stock");
//     const body = query;
//     console.log(JSON.stringify(body));
//     let headers = new Headers();
//     headers.append('Content-Type', 'application/json');
//     return this.http.post('https://localhost:3443/user/checkStock', body)
//       .map((response: Response) => response.json());
//   }

}
