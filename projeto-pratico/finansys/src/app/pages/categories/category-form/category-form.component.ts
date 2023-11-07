import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';

import { BaseResourceFormComponent } from 'src/app/shared';

import { Category, CategoryService } from '../shared';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent extends BaseResourceFormComponent<Category>{

  constructor(
    protected categoryService: CategoryService, 
    protected override injector: Injector
  ){ 
    super(injector, new Category(), categoryService, Category.fromJson)
  }

  protected buildResourceForm(){
    this.resourceForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  protected override  creationPageTitle(): string {
    return "Cadastro de Nova Categoria";
  }

  protected override editionPageTitle(): string {
    const categoryName = this.resource.name || "";
    return "Editando Categoria: " + categoryName;
  }

}
