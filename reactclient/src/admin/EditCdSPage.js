import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";

function EditCdSPage({ auth }) {
  const [loaded, setLoaded] = useState(false);
  const [aree, setAree] = useState([]);
  const [settori, setSettori] = useState([]);
  const [corsi, setCorsi] = useState([]);
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [ssdinsegnamento, setSSDInsegnamento] = useState();
  const [docenti, setDocenti] = useState([]);
  const [cfublocchi, setCfuBlocchi] = useState([0, 0, 0]);
  const [totalecfu, setTotaleCfu] = useState(0);
  const [formValues, setFormValues] = useState({ insegnamentiinseriti: [] });
  const [validated, setValidated] = useState(false);
  const [disableblock, setDisableBlock] = useState(true);
  const [message, setMessage] = useState({ error: false, text: "" });
  const [alertelimina, setAlertElimina] = useState(false);
  const [nomecorso, setNomecorso] = useState();
  const navigate = useNavigate();

  // riferimenti ai vari campi della form in modo da poter modificare
  // i valori selezionando il CdS da modificare
  const refnome = useRef(null);
  const refanno = useRef(null);
  const reftipo = useRef(null);
  const refcfutir = useRef(null);
  const refcfupf = useRef(null);
  const refarea = useRef(null);
  const refsettore = useRef(null);
  const refins = useRef(null);
  const refyear = useRef(null);
  const refprof = useRef(null);
  const refoptional = useRef(null);
  const refblock = useRef(null);

  // quando si carica l'elemento scarico i dati dal server
  useEffect(() => {
    // scarico i corsi di studio e li salvo in corsi
    async function get_cds() {
      fetch("http://localhost:9000/users/getCds", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status !== 200) {
            setMessage({ error: true, text: res.message });
          } else {
            setCorsi(res.corsi);
            setLoaded(true);
          }
        });
    }

    // scarico gli SSD e li salvo in aree
    async function fetchSSD() {
      fetch("/javascripts/ssd.json")
        .then((res) => res.json())
        .then((result) => {
          setAree(result.area);
        });
    }

    // scarico la lista degli insegnamenti e la salvo in insegnamenti
    async function fetchTeaching() {
      fetch("http://localhost:9000/admins/getTeachings", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setInsegnamenti(res.insegnamenti);
          }
        });
    }

    // scarico la lista dei professori e la salvo in docenti
    async function fetchProfessors() {
      fetch("http://localhost:9000/admins/getProfessors", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setDocenti(res.docenti);
          }
        });
    }
    get_cds();
    fetchSSD();
    fetchTeaching();
    fetchProfessors();
  }, []);

  // salvo i dati che inserisco nella form per poterli inviare al server
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({ ...prevState, [name]: value }));
  };

  const selectCorso = (e) => {
    if (e.target.value !== "") {
      for (let corso of corsi) {
        if (corso.IDCorso.toString() === e.target.value) {
          refnome.current.value = corso.Denominazione;
          refanno.current.value = corso.AnnoAccademico;
          reftipo.current.value = corso.TipoCorso;
          refcfutir.current.value = corso.CFUTirocinio;
          refcfupf.current.value = corso.CFUProvaFinale;
          setFormValues((prevState) => ({
            ...prevState,
            idcorso: e.target.value,
            name: corso.Denominazione,
            academicyear: corso.AnnoAccademico,
            type: corso.TipoCorso,
            cfutir: corso.CFUTirocinio,
            cfupf: corso.CFUProvaFinale,
          }));
          setNomecorso(corso.Denominazione + " " + corso.AnnoAccademico);
          get_cdsteachings(e.target.value);
        }
      }
    } else {
      refnome.current.value = "";
      refanno.current.value = "";
      reftipo.current.value = "";
      refcfutir.current.value = "";
      refcfupf.current.value = "";
    }
  };

  // scarico gli insegnamenti del corso da modificare
  // e li salvo in insegnamentiinseriti
  async function get_cdsteachings(idcorso) {
    fetch("http://localhost:9000/users/getCdsTeachings", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          let insegnamenticorso = [];
          let totcfu = 0;
          let totcfublocchi = [0, 0, 0];
          let settore = "";

          for (let ins of res.insegnamenti) {
            if (ins.IDCorso.toString() === idcorso) {
              // recupero il docente dell'insegnamento
              for (let docente of docenti) {
                if (docente.Matricola === ins.MatDocente) {
                  ins.professor = docente;
                  break;
                }
              }
              // recupero i cfu dell'insegnamento
              for (let i of insegnamenti) {
                if (i.IDIns === ins.IDIns) {
                  if (ins.aScelta) {
                    settore = i.SSD;
                    totcfublocchi[parseInt(ins.Blocco) - 1] = i.CFU;
                  } else {
                    totcfu += i.CFU;
                  }
                  break;
                }
              }
              insegnamenticorso.push(ins);
            }
          }

          for (let area of aree) {
            if (area.settori.includes(settore)) {
              refarea.current.value = area.tipo;
              setSettori(area.settori);
              setFormValues((prevState) => ({
                ...prevState,
                ssd: settore,
              }));
              break;
            }
          }
          setTotaleCfu(totcfu);
          setCfuBlocchi(totcfublocchi);
          setFormValues((prevState) => ({
            ...prevState,
            insegnamentiinseriti: insegnamenticorso,
          }));
        }
      });
  }

  // controllo la validità dei dati prima di inviarli al server
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    setValidated(true);
    if (form.checkValidity() === true && checkCFUTotal()) {
      submitForm(event);
    }
  };

  // controllo se i cfu totali corrispondono a quelli del tipo di corso
  // se i cfu sono errati mostro un alert di errore.
  // durante il testing si può commentare per inserire meno insegnamenti
  const checkCFUTotal = () => {
    let cfu =
      totalecfu +
      (parseInt(formValues?.cfutir) || 0) +
      (parseInt(formValues?.cfupf) || 0) +
      cfublocchi[0] +
      cfublocchi[1] +
      cfublocchi[2];

    console.log(cfu);
    if (formValues.type === "triennale" && cfu !== 180) {
      setMessage({
        error: true,
        text: "Il corso triennale deve erogare 180 CFU",
      });
      return false;
    } else if (formValues.type === "magistrale" && cfu !== 120) {
      setMessage({
        error: true,
        text: "Il corso magistrale deve erogare 120 CFU",
      });
      return false;
    } else if (formValues.type === "ciclo unico" && cfu !== 300) {
      setMessage({
        error: true,
        text: "Il corso a ciclo unico deve erogare 300 CFU",
      });
      return false;
    } else {
      return true;
    }
  };

  // invio i dati al server
  const submitForm = (e) => {
    e.preventDefault();

    // controllo se i professori insegnano già la materia in due corsi
    // o se erogano più di 21 CFU
    fetch("http://localhost:9000/admins/checkProfCFUEdit", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(formValues.insegnamentiinseriti),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== 200) {
          setMessage({ error: true, text: res.message });
        } else {
          return fetch("http://localhost:9000/admins/editCdS", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(formValues),
          });
        }
      })
      .then((res) => res.json())
      .then((res) => {
        // se il server risponde con 200 renderizzo la pagina di successo
        // altrimenti renderizzo la pagina di errore,
        // se il corso già esiste mostro un alert di errore
        if (res.status === 403) {
          console.log(res);
          setMessage({
            error: true,
            text: res.message,
          });
          window.scrollTo(0, 0);
        } else if (res.status === 405) {
          console.log(res);
          setMessage({
            error: true,
            text: `Corso di studi ${res.corso} già esistente`,
          });
          window.scrollTo(0, 0);
        } else if (res.status !== 200) {
          navigate("/error", {
            state: {
              status: res.status,
              message: res.message,
            },
          });
        } else {
          navigate("/landing", {
            state: {
              message: "Corso di Studi " + res.corso + " modificato",
            },
          });
        }
      });
  };

  const deleteCdS = (e) => {
    e.preventDefault();

    fetch("http://localhost:9000/admins/deleteCdS", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(formValues),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        // se il server risponde con 200 renderizzo la pagina di successo
        // altrimenti renderizzo la pagina di errore,
        // se il corso già esiste mostro un alert di errore
        if (res.status === 405) {
          console.log(res);
          setMessage({
            error: true,
            text: res.message,
          });
          window.scrollTo(0, 0);
        } else if (res.status !== 200) {
          navigate("/error", {
            state: {
              status: res.status,
              message: res.message,
            },
          });
        } else {
          navigate("/landing", {
            state: {
              message: "Corso di Studi " + nomecorso + " eliminato",
            },
          });
        }
      });
  };

  // quando seleziono un area popolo il campo successivo
  // con i settori
  const selectArea = (e) => {
    if (loaded) {
      if (e.target.value !== "") {
        for (let area of aree) {
          if (area.tipo === e.target.value) {
            setSettori(area.settori);
            break;
          }
        }
      } else {
        setSettori([]);
      }
    }
  };

  // salvo il settore nei dati da inviare
  const selectSettore = (e) => {
    if (loaded) {
      setFormValues((prevState) => ({
        ...prevState,
        ssd: e.target.value,
      }));

      if (e.target.value !== formValues.ssd) {
        // rimuovo gli insegnamenti a scelta se l'SSD viene modificato
        let copiainsegnamenti = JSON.parse(
          JSON.stringify(formValues.insegnamentiinseriti)
        );
        for (let ins of copiainsegnamenti) {
          if (ins.aScelta) {
            copiainsegnamenti.splice(copiainsegnamenti.indexOf(ins), 1);
          }
        }

        setFormValues((prevState) => ({
          ...prevState,
          insegnamentiinseriti: copiainsegnamenti,
        }));

        setMessage({
          error: true,
          text: "Rimossi insegnamenti a scelta per modifica SSD",
        });
      }
    }
  };

  // quando seleziono un insegnamento salvo il suo ssd in modo
  // da far visualizzare solo i docenti con lo stesso ssd
  const selectTeaching = (e) => {
    if (loaded) {
      if (e.target.value !== "") {
        for (let insegnamento of insegnamenti) {
          if (insegnamento.IDIns.toString() === e.target.value) {
            setSSDInsegnamento(insegnamento.SSD);
            break;
          }
        }
      } else {
        setSSDInsegnamento([]);
      }
    }
  };

  // se seleziono "A Scelta" abilito il campo in cui selezioanre il blocco
  const selectOptional = (e) => {
    if (e.target.checked) {
      setDisableBlock(false);
    } else {
      setDisableBlock(true);
    }
  };

  // funzione che controlla se l'insegnamento da inserire per il cds
  // è corretto in vari modi, se esiste già, se l'ssd è giusto, etc...
  const addTeaching = (event) => {
    setMessage({
      error: false,
      text: "",
    });

    //controllo se è già stato inserito
    let continua = true;

    for (let inserito of formValues.insegnamentiinseriti) {
      if (inserito.IDIns.toString() === refins.current.value) {
        continua = false;
        console.log("Insegnamento già inserito");
        setMessage({ error: true, text: "Insegnamento già inserito" });
        break;
      }
    }

    // controlli vari sulla correttezza dell'insegnamento da inserire
    if (refoptional.current.checked) {
      if (refblock.current.value !== "") {
        if (refyear.current.value !== "1") {
          for (let insegnamento of insegnamenti) {
            if (insegnamento.IDIns.toString() === refins.current.value) {
              //controllo se l'insegnamento a scelta appartiene al SSD
              if (insegnamento.SSD !== formValues.ssd) {
                continua = false;
                console.log(
                  "Insegnamento a scelta non appartenente allo stesso SSD"
                );
                setMessage({
                  error: true,
                  text: "Insegnamento a scelta non appartenente allo stesso SSD",
                });
                break;
              }

              let counterblock = 0;
              for (let inserito of formValues.insegnamentiinseriti) {
                if (inserito.block === refblock.current.value) {
                  counterblock++;

                  //controllo se ci sono già 3 insegnamenti nel blocco
                  if (counterblock === 3) {
                    continua = false;
                    console.log("Inseriti già 3 insegnamenti nel blocco");
                    setMessage({
                      error: true,
                      text: "Inseriti già 3 insegnamenti nel blocco",
                    });
                    break;
                  }

                  //controllo se ha gli stessi CFU del blocco
                  if (inserito.CFU !== insegnamento.CFU) {
                    continua = false;
                    console.log(
                      "Insegnamento a scelta non ha gli stessi CFU degli altri del blocco"
                    );
                    setMessage({
                      error: true,
                      text: "Insegnamento a scelta non ha gli stessi CFU degli altri del blocco",
                    });
                    break;
                  }
                }
              }
            }
          }
        } else {
          continua = false;
          console.log(
            "Gli insegnamenti a scelta non possono essere del primo anno"
          );
          setMessage({
            error: true,
            text: "Gli insegnamenti a scelta non possono essere del primo anno",
          });
        }
      } else {
        continua = false;
        console.log("Devi selezionare un blocco per l'insegnamento a scelta");
        setMessage({
          error: true,
          text: "Devi selezionare un blocco per l'insegnamento a scelta",
        });
      }
    }

    // aggiungo l'insegnamento ai dati da inviare e pulisco i campi
    // per poter aggiungere nuovi insegnamenti
    if (continua) {
      for (let insegnamento of insegnamenti) {
        if (insegnamento.IDIns.toString() === refins.current.value) {
          for (let docente of docenti) {
            if (docente.Matricola.toString() === refprof.current.value) {
              let copiains = JSON.parse(
                JSON.stringify(formValues.insegnamentiinseriti)
              );
              insegnamento.professor = docente;
              insegnamento.Anno = refyear.current.value;
              insegnamento.aScelta = refoptional.current.checked;
              insegnamento.Blocco = refblock.current.value;
              copiains.push(insegnamento);
              setFormValues((prevState) => ({
                ...prevState,
                insegnamentiinseriti: copiains,
              }));

              //se è a scelta non aumento il numero di CFU
              if (insegnamento.aScelta) {
                let cfu = cfublocchi;
                cfu[parseInt(insegnamento.Blocco) - 1] = insegnamento.CFU;
                setCfuBlocchi(cfu);
              } else {
                setTotaleCfu(totalecfu + insegnamento.CFU);
              }
              refprof.current.value = "";
              refins.current.value = "";
              refyear.current.value = "";
              refprof.current.value = "";
              refoptional.current.checked = false;
              refblock.current.value = "";
              setDisableBlock(true);
              break;
            }
          }
          break;
        }
      }
    }
  };

  // funzione che rimuove l'insegnamento dai dati da inviare
  const removeTeaching = (insegnamento) => {
    for (let inserito of formValues.insegnamentiinseriti) {
      if (inserito.IDIns === insegnamento.IDIns) {
        let copiains = JSON.parse(
          JSON.stringify(formValues.insegnamentiinseriti)
        );
        copiains.splice(formValues.insegnamentiinseriti.indexOf(inserito), 1);
        setFormValues((prevState) => ({
          ...prevState,
          insegnamentiinseriti: copiains,
        }));

        //Rimuovo i CFU dal blocco se è l'ultimo che rimuovo
        if (insegnamento.aScelta) {
          let cfu = [0, 0, 0];
          for (let ins of copiains) {
            if (ins.Blocco) {
              cfu[ins.Blocco - 1] = ins.CFU;
            }
          }
          setCfuBlocchi(cfu);
        } else {
          setTotaleCfu(totalecfu - insegnamento.CFU);
        }
        break;
      }
    }
  };

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  // se non sono un admin visualizzo un messaggio di errore
  if (!auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei connesso, accedi</p>
        <Link to="/accedi">
          <Button variant="info">&nbsp;Accedi&nbsp;</Button>
        </Link>
      </Container>
    );
  } else if (!auth?.isAdmin) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei un Admin</p>
      </Container>
    );
  } else {
    return (
      <Container>
        <h2 className="text-center">Seleziona Corso di Studi</h2>
        <InputGroup className="my-3">
          <InputGroup.Text>Corso di Studi</InputGroup.Text>
          <Form.Control
            as="select"
            required
            custom
            defaultValue=""
            onChange={selectCorso}
          >
            <option key=""></option>
            {corsi.map((corso) => (
              <option key={corso.IDCorso} value={corso.IDCorso}>
                {corso.Denominazione + " " + corso.AnnoAccademico}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Selezionare il Corso di Studi da modificare
          </Form.Control.Feedback>
        </InputGroup>

        <Form noValidate validated={validated}>
          <h2 className="text-center">Modifica Corso di Studi</h2>
          <InputGroup className="mb-3">
            <InputGroup.Text>Denominazione</InputGroup.Text>
            <Form.Control
              name="name"
              required
              type="text"
              onChange={handleChange}
              ref={refnome}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Denominazione
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Anno Accademico</InputGroup.Text>
            <Form.Control
              name="academicyear"
              required
              type="text"
              onChange={handleChange}
              ref={refanno}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Anno Accademico
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="my-3">
            <InputGroup.Text>Tipo Corso</InputGroup.Text>
            <Form.Control
              name="type"
              as="select"
              required
              custom
              defaultValue=""
              onChange={handleChange}
              ref={reftipo}
            >
              <option key=""></option>
              <option key="1" value="triennale">
                Triennale
              </option>
              <option key="2" value="magistrale">
                Magistrale
              </option>
              <option key="3" value="ciclo unico">
                Ciclo Unico
              </option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il numero di CFU
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="my-3">
            <InputGroup.Text>CFU Tirocinio</InputGroup.Text>
            <Form.Control
              name="cfutir"
              as="select"
              required
              custom
              defaultValue=""
              onChange={handleChange}
              ref={refcfutir}
            >
              <option key=""></option>
              <option key="3">3</option>
              <option key="6">6</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il numero di CFU del Tirocinio
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="my-3">
            <InputGroup.Text>CFU Prova Finale</InputGroup.Text>
            <Form.Control
              name="cfupf"
              as="select"
              required
              custom
              defaultValue=""
              onChange={handleChange}
              ref={refcfupf}
            >
              <option key=""></option>
              <option key="9">9</option>
              <option key="12">12</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il numero di CFU della Prova Finale o Tesi
            </Form.Control.Feedback>
          </InputGroup>

          <p className="lead mt-4">Settore Scientifico-Disciplinare:</p>

          <InputGroup className="mb-3">
            <InputGroup.Text>Area&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="area"
              as="select"
              required
              custom
              defaultValue=""
              ref={refarea}
              onChange={selectArea}
            >
              <option key="" value=""></option>
              {aree.map((area) => (
                <option key={area.numero}>{area.tipo}</option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare area disciplinare
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Settore&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="ssd"
              as="select"
              required
              custom
              defaultValue=""
              ref={refsettore}
              onChange={selectSettore}
            >
              <option key=""></option>
              {settori.map((settore) => (
                <option key={settore}>{settore}</option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il settore disciplinare
            </Form.Control.Feedback>
          </InputGroup>

          <h2 className="text-center">Insegnamenti</h2>
          {message.error ? (
            <Alert
              variant="danger"
              onClose={() => setMessage({ error: false, text: "" })}
              dismissible
            >
              <p>{message.text}</p>
            </Alert>
          ) : (
            <></>
          )}
          <Table striped hover bordered responsive>
            <thead>
              <tr>
                <th>Insegnamento</th>
                <th>Anno</th>
                <th>Docente</th>
                <th>CFU</th>
                <th>A Scelta</th>
                <th>Blocco</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formValues.insegnamentiinseriti.map((insegnamento) => (
                <>
                  <tr>
                    <td>{insegnamento.Denominazione}</td>
                    <td>{insegnamento.Anno}</td>
                    <td>
                      {insegnamento.professor.Cognome +
                        " " +
                        insegnamento.professor.Nome}
                    </td>
                    <td>{insegnamento.CFU}</td>
                    <td>{insegnamento.aScelta ? "Sì" : "No"}</td>
                    <td>{insegnamento.Blocco}</td>

                    <td>
                      <Button
                        variant="danger"
                        type="button"
                        onClick={() => removeTeaching(insegnamento)}
                      >
                        Rimuovi
                      </Button>
                    </td>
                  </tr>
                </>
              ))}
              <tr>
                <td>Tirocinio</td>
                <td></td>
                <td>---</td>
                <td>{formValues.cfutir}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Prova Finale</td>
                <td></td>
                <td>---</td>
                <td>{formValues.cfupf}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th>Totale CFU</th>
                <td>
                  {totalecfu +
                    (parseInt(formValues?.cfutir) || 0) +
                    (parseInt(formValues?.cfupf) || 0) +
                    cfublocchi[0] +
                    cfublocchi[1] +
                    cfublocchi[2]}
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </Table>
        </Form>

        <Form noValidate>
          <Row className="align-items-center mb-2">
            <Col xs={"auto"}>
              <InputGroup>
                <InputGroup.Text>Insegnamento</InputGroup.Text>
                <Form.Control
                  name="teaching"
                  as="select"
                  custom
                  defaultValue=""
                  ref={refins}
                  onChange={selectTeaching}
                >
                  <option key="" value=""></option>
                  {insegnamenti.map((insegnamento) => (
                    <option key={insegnamento.IDIns} value={insegnamento.IDIns}>
                      {`${insegnamento.Denominazione} - ${insegnamento.CFU} CFU`}
                    </option>
                  ))}
                </Form.Control>
              </InputGroup>
            </Col>
            <Col xs={"auto"}>
              <InputGroup>
                <InputGroup.Text>Anno</InputGroup.Text>
                <Form.Control
                  name="year"
                  as="select"
                  custom
                  defaultValue=""
                  ref={refyear}
                >
                  <option key="" value=""></option>
                  <option key="1">1</option>
                  <option key="2">2</option>
                  {formValues.type === "triennale" ? (
                    <>
                      <option key="3">3</option>
                    </>
                  ) : formValues.type === "ciclo unico" ? (
                    <>
                      <option key="3">3</option>
                      <option key="4">4</option>
                      <option key="5">5</option>
                    </>
                  ) : (
                    <></>
                  )}
                </Form.Control>
              </InputGroup>
            </Col>
            <Col xs={3}>
              <InputGroup>
                <InputGroup.Text>Docente</InputGroup.Text>
                <Form.Control
                  name="professor"
                  as="select"
                  custom
                  defaultValue=""
                  length="20"
                  ref={refprof}
                >
                  <option key="" value=""></option>
                  {docenti.map(
                    (docente) =>
                      docente.SSD === ssdinsegnamento && (
                        <option
                          key={docente.Matricola}
                          value={docente.Matricola}
                        >
                          {docente.Cognome + " " + docente.Nome}
                        </option>
                      )
                  )}
                </Form.Control>
              </InputGroup>
            </Col>
            <Col xs={"auto"}>
              <Form.Check
                type="checkbox"
                name="optional"
                label="A Scelta"
                ref={refoptional}
                onChange={selectOptional}
              />
            </Col>
            <Col xs={"auto"}>
              <InputGroup>
                <InputGroup.Text>Blocco</InputGroup.Text>
                <Form.Control
                  name="block"
                  as="select"
                  custom
                  disabled={disableblock}
                  defaultValue=""
                  ref={refblock}
                >
                  <option key=""></option>
                  <option key="1">1</option>
                  <option key="2">2</option>
                  <option key="3">3</option>
                </Form.Control>
              </InputGroup>
            </Col>
            <Col>
              <Button variant="success" onClick={addTeaching}>
                Aggiungi
              </Button>
            </Col>
          </Row>
        </Form>

        <ButtonGroup className="my-3">
          <Button
            variant="primary"
            type="submit"
            name="ok"
            id="ok"
            onClick={handleSubmit}
          >
            Modifica Corso
          </Button>
          <Button
            variant="danger"
            type="submit"
            name="ok"
            id="ok"
            onClick={() => setAlertElimina(true)}
          >
            Elimina Corso
          </Button>
        </ButtonGroup>
        {alertelimina ? (
          formValues?.idcorso ? (
            <Alert
              variant="danger"
              onClose={() => setAlertElimina(false)}
              dismissible
            >
              <p>Sei sicuro di voler eliminare il corso {nomecorso}?</p>
              <Button variant="outline-danger" onClick={deleteCdS}>
                Elimina
              </Button>
            </Alert>
          ) : (
            <Alert
              variant="danger"
              onClose={() => setAlertElimina(false)}
              dismissible
            >
              <p> Non hai selezionato nessun corso da eliminare</p>
            </Alert>
          )
        ) : (
          <></>
        )}
      </Container>
    );
  }
}

export default EditCdSPage;
