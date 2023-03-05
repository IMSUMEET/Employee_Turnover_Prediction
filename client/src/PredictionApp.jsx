import { useEffect, useState } from 'react';

import InputForm from './pages/InputForm';
import IndividualEval from './pages/IndividualEval';
import CumulativeEval from './pages/CumulativeEval';

export default function PredictionApp({onAuthFail, token}) {
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [result, setResult] = useState({});
  useEffect(()=>{
    if(submitted && result.res){
      if(!result.file){
        setSelected(0)
      }
    }
  },[submitted,result])
  const handleEnd = () => {
    setSubmitted(false);
    setResult({});
    setSelected(-1);
  }
  const handleBack = () => {
    if(result.res.length === 1){
      handleEnd();
      return;
    }
    setSelected(-1);
  }
  const handleSubmit = (res) => {
    setSubmitted(true);
    setResult(res);
  }
  if(!submitted || !result.res){
    return <InputForm onSubmit={handleSubmit} onAuthFail={onAuthFail} token={token}/>
  }
  if(selected >= 0){
    return(<IndividualEval res={result.res[selected]} onEnd={handleEnd} onBack={handleBack}/>)
  }
  return <CumulativeEval results={result.res} setSelected={setSelected} onEnd={handleEnd} />
}
