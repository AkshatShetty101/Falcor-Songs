import { Component } from '@angular/core';
import { HttpService } from './Shared/http.service';
import * as falcor from 'falcor';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  $ref = falcor.Model.ref;
  $type = falcor.Model.type;
  title = 'app';
  output: string = 'A';
  j = {
    copy:{ $type: "ref", value: "name" },
    name: {$type:"atom",value:"A"},
    songList: []
  };
  model = new falcor.Model({
    cache: this.j 
  });
  constructor(private http: HttpService) { }
  ngOnInit() {
    this.model.call('copy')
    .subscribe((data)=>{
      console.log(data);
    },
    (err)=>{
      console.log(err);
    });
    this.http.getModelData()
      .subscribe(
      (data) => {
        console.log(data);
        data = JSON.parse(data).songList;
        console.log(data);
        this.model.setValue('songList', data)
          .subscribe(
          (result1) => {
            console.log('in!');
            console.log(result1);
            this.model.get(['name'])
              .subscribe(
              (result) => {
                console.log(result);
                let x = JSON.stringify(result, null, 4);
                this.output = x;
              }, (err) => {
                console.log(err);
              }
              );
          },
          (err) => {
            console.log(err);
          }
          );
      },
      (err) => {
        console.log(err);
      });
  }
}
