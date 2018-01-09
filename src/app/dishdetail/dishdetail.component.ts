import { Component, OnInit, Inject } from '@angular/core';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {FormBuilder,FormGroup,Validators } from '@angular/forms';

import {Dish } from '../shared/dish'; 
import { DishService } from '../services/dish.service';
import { Comment} from '../shared/comment';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
 
  dish : Dish;
  dishIds : number[];
  prev : number;
  next : number;
  commentForm: FormGroup;
  comment: Comment;
  Date= (new Date()).toDateString();

  formErrors = {
    author:'',
    comment:''
  };

  validationMessages ={
    'author':{
      'required': 'Author Name is required',
      'minlength': 'Author Name must be atleast 2 character long '
    },
    'comment':{
      'required':'This field is required'
    }

  }

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb:FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
    }

  ngOnInit() {
  
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }
  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }
 
  goBack(): void{
    this.location.back();
  }

  createForm(){
    this.commentForm = this.fb.group({
      rating: '5',
      comment:['' ,Validators.required ],
      author: ['',[Validators.required ,Validators.minLength(2) ] ], 
      date: this.Date 
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));
  }

  onSubmit(){
    this.comment =this.commentForm.value;
    console.log(this.comment);
    this.commentForm.reset({
      rating: '5',
      comment: '',
      author: '',
      date: this.Date
    });
    this.dish.comments.push(this.comment);
  }

  onValueChanged(data ?: any){
    if(!this.commentForm){ return;}
    const form = this.commentForm;
    for(const field in this.formErrors){
      this.formErrors[field] = '';
      const control = form.get(field);
      if(control && control.dirty && !control.valid){
        const messages = this.validationMessages[field];
        for(const key in control.errors){
          this.formErrors[field]+= messages[key] + '';
        }
      }
    }
  }
  
}
