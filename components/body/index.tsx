import { observer } from 'mobx-react-lite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Image from 'next/image';

function Body() {
  const Router = useRouter();

  return (
      <div className='w-full flex flex-col font-primary '>
        <div className='bg-website_bg bg-cover bg-center'>
          {/* section-1 */}
          <div className='container w-2/4 text-center mx-auto lg:pt-36 pt-44'>
            <h1 className='font-bold sm:text-7xl lg:text-7xl text-5xl text-blue p-2'>
              Dodging Turtis
            </h1>
            <p className='p-2 text-lg'>- May the Fastest Turtle Win -</p>
            <div className='container w-full mx-auto pt-5'>
              <button
                  onClick={() => Router.push('/profile')}
                  className='bg-lightblue border hover:scale-110 hover:brightness-105 border-lightblue lg:rounded-xl rounded-l lg:px-10 lg:py-5 p-3 text-blue font-bold lg:text-3xl text-2xl text-center'>
                <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon> Play Now
              </button>
            </div>
          </div>
        </div>

        {/* section-4 */}
        <div className='lg:text-left text-center flex flex-col-reverse lg:flex-row w-full px-16 pt-16  bg-pattern'>
          <div className='lg:w-2/3 w-full mx-auto'>
          </div>
          <div className='flex'>
            <Image
                src='/assets/website/turtles.svg'
                alt='Homepage turtles'
                height={450}
                width={200}
            />
          </div>
        </div>
      </div>
  );
}

export default observer(Body);
