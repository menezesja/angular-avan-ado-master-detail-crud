import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry, EntryService } from '../shared';

import { switchMap } from 'rxjs';

import * as toasrt from 'toastr';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked{

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(){
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentAction == "new")
      this.createEntry();
    else
      this.updateEntry();
  }

  //private methods
  private setCurrentAction(){
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"
    
  }

  private buildEntryForm(){
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: ["expense", [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private loadEntry(){
    if(this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getByID(+params.get("id"))),
      ).subscribe({
        next: (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry);
        },
        error: () => alert('Ocorreu um error no servidor, tente mais tarde'),
      })
    }
  }


  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = "Cadastro de Novo Lançamento"
    else{
      const entryName = this.entry.name || ""
      this.pageTitle = "Editando Lançamento: " + entryName;
    }
  }
  
  private createEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry)
      .subscribe({
        next: entry => this.actionsForSuccess(entry),
        error: error => this.actionsForError(error),
      });
  }

  private updateEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry)
    .subscribe({
      next: entry => this.actionsForSuccess(entry),
      error: error => this.actionsForError(error)
    });
  }

  private actionsForSuccess(entry: Entry){
    toasrt.success("Solicitação Processada com sucesso!");

    this.router.navigateByUrl("entries", {skipLocationChange: true}).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
    )
  }

  private actionsForError(error){
    toasrt.error("Ocorreu um erro ao processar a sua solicitação");

    this.submittingForm = false;

    if(error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }


}